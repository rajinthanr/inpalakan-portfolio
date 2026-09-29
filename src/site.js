(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.gallery-grid .project-card')];
  const count = document.querySelector('#visible-count');
  const searchInput = document.querySelector('[data-gallery-search]');
  const emptyState = document.querySelector('.empty-state');
  const samplePatternSections = [
    ...document.querySelectorAll('[data-sample-patterns]')
  ];
  let currentCategory = 'all';
  let currentQuery = '';

  function applyFilters() {
    let visible = 0;
    cards.forEach(card => {
      const matchCat = currentCategory === 'all' ||
          card.dataset.category === currentCategory;
      const text = (card.textContent + ' ' + (card.dataset.keywords || ''))
                       .toLowerCase();
      const matchQuery = !currentQuery || text.includes(currentQuery);
      const show = matchCat && matchQuery;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (emptyState) emptyState.hidden = visible > 0;
    samplePatternSections.forEach(section => {
      const visibleSamples =
          section.querySelectorAll('.project-card:not([hidden])').length;
      section.hidden = visibleSamples === 0;
    });
  }

  function selectCategory(category, updateUrl = false) {
    if (!filters.length) return;
    currentCategory =
        filters.some(button => button.dataset.filter === category) ? category :
                                                                     'all';
    filters.forEach(button => {
      const active = button.dataset.filter === currentCategory;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (currentCategory === 'all')
        url.searchParams.delete('category');
      else
        url.searchParams.set('category', currentCategory);
      history.replaceState(null, '', url);
    }
  }

  filters.forEach(
      button => button.addEventListener(
          'click', () => selectCategory(button.dataset.filter, true)));
  selectCategory(
      new URLSearchParams(window.location.search).get('category') || 'all');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentQuery = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Project Page Multi-View Switcher
  const thumbButtons = [...document.querySelectorAll('.thumb-btn')];
  const activeDetailImg = document.querySelector('#active-detail-image');

  thumbButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      thumbButtons.forEach(b => {
        b.classList.remove('is-active');
        b.removeAttribute('aria-current');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-current', 'true');
      if (activeDetailImg && btn.dataset.viewSrc) {
        activeDetailImg.src = btn.dataset.viewSrc;
        activeDetailImg.alt = btn.dataset.viewAlt || '';
      }
    });
  });

  // WhatsApp link generator on project page
  document.querySelectorAll('[data-whatsapp-code]').forEach(link => {
    const code = link.dataset.whatsappCode;
    const target = new URL(link.href);
    target.searchParams.set(
        'text',
        `Hello Inpalakan Timbers, I am interested in design ${
            code}. Could we discuss something similar for my space? ${
            window.location.href}`);
    link.href = target.href;
  });

  // Share button
  document.querySelectorAll('[data-share]')
      .forEach(button => button.addEventListener('click', async () => {
        const title = `${button.dataset.title} · Inpalakan Timbers`;
        const url = window.location.href;
        try {
          if (navigator.share) {
            await navigator.share({title, url});
          } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            const label = button.querySelector('span');
            if (label) {
              label.textContent = 'Link copied';
              window.setTimeout(() => {
                label.textContent = 'Share design';
              }, 2500);
            }
          } else {
            window.prompt('Copy this design link:', url);
          }
        } catch (error) {
          if (error.name !== 'AbortError')
            console.error('Could not share this design', error);
        }
      }));

  // Fullscreen viewer with collection-aware navigation and touch gestures.
  const lightboxModal = document.querySelector('#fullscreen-lightbox');
  const playlistEl = document.querySelector('#catalog-playlist');

  if (lightboxModal && playlistEl) {
    let fullPlaylist = [];
    try {
      fullPlaylist = JSON.parse(playlistEl.textContent);
    } catch (error) {
      console.error('Failed to parse catalog playlist', error);
    }

    let activePlaylist = fullPlaylist;
    let currentIndex = 0;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let lastTap = 0;
    let tapTimer = null;

    const lbImg = lightboxModal.querySelector('#lb-image');
    const lbCode = lightboxModal.querySelector('#lb-code');
    const lbCounter = lightboxModal.querySelector('#lb-counter');
    const lbWhatsappBtn = lightboxModal.querySelector('#lb-whatsapp-btn');
    const lbShareBtn = lightboxModal.querySelector('#lb-share-btn');
    const lbDownloadBtn = lightboxModal.querySelector('#lb-download-btn');
    const lbPrevBtn = lightboxModal.querySelector('#lb-prev-btn');
    const lbNextBtn = lightboxModal.querySelector('#lb-next-btn');
    const lbCloseBtn = lightboxModal.querySelector('#lb-close-btn');
    const lbStage = lightboxModal.querySelector('.lightbox-stage');
    const lbBackdrop = lightboxModal.querySelector('.lightbox-backdrop');
    const lbThumbnails = lightboxModal.querySelector('#lb-thumbnails');

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const distance = touches => Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY);

    function applyTransform(animate = false) {
      lbImg.classList.toggle('is-zoomed', scale > 1);
      lbImg.classList.toggle('is-resetting', animate);
      lbImg.style.transform =
          `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
      if (animate) window.setTimeout(() => lbImg.classList.remove('is-resetting'), 220);
    }

    function resetZoom(animate = false) {
      scale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform(animate);
    }

    function toggleControls() {
      lightboxModal.classList.toggle('controls-hidden');
    }

    function preloadAdjacent() {
      if (activePlaylist.length < 2) return;
      if (currentIndex < activePlaylist.length - 1) {
        new Image().src = activePlaylist[currentIndex + 1].src;
      }
      if (currentIndex > 0) {
        new Image().src = activePlaylist[currentIndex - 1].src;
      }
    }

    function renderThumbnails() {
      if (!lbThumbnails) return;
      lbThumbnails.innerHTML = activePlaylist.map((item, index) => `
        <button class="lb-thumb${index === currentIndex ? ' is-active' : ''}" type="button" data-lb-index="${index}" aria-label="View ${item.code}${item.label ? `, ${item.label}` : ''}">
          <img src="${item.src}" alt="" loading="lazy">
        </button>`).join('');
      lbThumbnails.querySelectorAll('[data-lb-index]').forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation();
          currentIndex = Number(button.dataset.lbIndex);
          renderSlide();
        });
      });
      lbThumbnails.querySelector('.is-active')?.scrollIntoView(
          {behavior: 'smooth', block: 'nearest', inline: 'center'});
    }

    function renderSlide(direction = '') {
      if (!activePlaylist.length) return;
      resetZoom();
      const item = activePlaylist[currentIndex];
      if (direction) {
        lbImg.classList.remove('is-sliding-next', 'is-sliding-prev');
        void lbImg.offsetWidth;
        lbImg.classList.add(
            direction === 'next' ? 'is-sliding-next' : 'is-sliding-prev');
      }
      lbImg.src = item.src;
      lbImg.alt = item.alt || item.title || item.code;
      lbCode.textContent = item.code;
      lbCounter.textContent = `${currentIndex + 1} / ${activePlaylist.length}`;
      if (lbPrevBtn) lbPrevBtn.disabled = currentIndex === 0;
      if (lbNextBtn) {
        lbNextBtn.disabled = currentIndex === activePlaylist.length - 1;
      }
      const itemPageUrl = new URL(item.url, window.location.href).href;
      if (lbWhatsappBtn) {
        const whatsappUrl = new URL(item.whatsapp);
        whatsappUrl.searchParams.set(
            'text',
            `Hello Inpalakan Timbers, I am interested in design ${item.code}: ${itemPageUrl}`);
        lbWhatsappBtn.href = whatsappUrl.href;
      }
      if (lbShareBtn) {
        lbShareBtn.dataset.shareTitle = `Inpalakan Timbers · ${item.code}`;
        lbShareBtn.dataset.shareUrl = itemPageUrl;
      }
      if (lbDownloadBtn) {
        const extension = item.src.split('.').pop().split(/[?#]/)[0] || 'jpg';
        lbDownloadBtn.href = item.src;
        lbDownloadBtn.download = `${item.code}.${extension}`;
      }
      renderThumbnails();
      preloadAdjacent();
    }

    function showNext() {
      if (scale > 1 || currentIndex >= activePlaylist.length - 1) return;
      currentIndex += 1;
      renderSlide('next');
    }

    function showPrev() {
      if (scale > 1 || currentIndex <= 0) return;
      currentIndex -= 1;
      renderSlide('prev');
    }

    function findItem(queryValue) {
      if (!queryValue) return null;
      const query = queryValue.toLowerCase();
      return fullPlaylist.find(item =>
          item.code.toLowerCase() === query ||
          item.src.toLowerCase().endsWith(query) ||
          (item.rawSrc && item.rawSrc.toLowerCase() === query));
    }

    function openLightbox(startSrcOrCode, categoryFilter = null) {
      const selected = findItem(startSrcOrCode) || fullPlaylist[0];
      if (!selected) return;
      const category = categoryFilter && categoryFilter !== 'all' ?
          categoryFilter : selected.category;
      activePlaylist = fullPlaylist.filter(item => item.category === category);
      if (!activePlaylist.length) activePlaylist = [selected];
      currentIndex = Math.max(0, activePlaylist.findIndex(item =>
          item.src === selected.src && item.code === selected.code));
      lightboxModal.hidden = false;
      lightboxModal.classList.remove('controls-hidden');
      requestAnimationFrame(() => {
        lightboxModal.classList.add('is-open');
        document.body.classList.add('lightbox-open');
      });
      renderSlide();
    }

    function closeLightbox() {
      resetZoom();
      lightboxModal.classList.remove('is-open', 'controls-hidden');
      document.body.classList.remove('lightbox-open');
      window.setTimeout(() => {
        if (!lightboxModal.classList.contains('is-open')) lightboxModal.hidden = true;
      }, 250);
    }

    lbNextBtn?.addEventListener('click', event => {
      event.stopPropagation();
      showNext();
    });
    lbPrevBtn?.addEventListener('click', event => {
      event.stopPropagation();
      showPrev();
    });
    lbCloseBtn?.addEventListener('click', closeLightbox);
    lbBackdrop?.addEventListener('click', closeLightbox);
    lbShareBtn?.addEventListener('click', async event => {
      event.stopPropagation();
      const title = lbShareBtn.dataset.shareTitle;
      const url = lbShareBtn.dataset.shareUrl;
      try {
        if (navigator.share) await navigator.share({title, url});
        else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
        else window.prompt('Copy this design link:', url);
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Could not share this design', error);
      }
    });

    window.addEventListener('keydown', event => {
      if (!lightboxModal.classList.contains('is-open')) return;
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        showNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrev();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      }
    });

    if (lbStage) {
      let startX = 0;
      let startY = 0;
      let deltaX = 0;
      let deltaY = 0;
      let startTranslateX = 0;
      let startTranslateY = 0;
      let pinchDistance = 0;
      let pinchScale = 1;
      let pinching = false;

      lbStage.addEventListener('touchstart', event => {
        if (event.touches.length === 2) {
          pinching = true;
          pinchDistance = distance(event.touches);
          pinchScale = scale;
          clearTimeout(tapTimer);
        } else if (event.touches.length === 1) {
          startX = event.touches[0].clientX;
          startY = event.touches[0].clientY;
          deltaX = 0;
          deltaY = 0;
          startTranslateX = translateX;
          startTranslateY = translateY;
        }
      }, {passive: true});

      lbStage.addEventListener('touchmove', event => {
        if (event.touches.length === 2 && pinching) {
          event.preventDefault();
          scale = clamp(pinchScale * distance(event.touches) / pinchDistance, 1, 4);
          if (scale === 1) translateX = translateY = 0;
          applyTransform();
        } else if (event.touches.length === 1) {
          deltaX = event.touches[0].clientX - startX;
          deltaY = event.touches[0].clientY - startY;
          if (scale > 1) {
            event.preventDefault();
            translateX = startTranslateX + deltaX;
            translateY = startTranslateY + deltaY;
            applyTransform();
          }
        }
      }, {passive: false});

      lbStage.addEventListener('touchend', event => {
        if (pinching) {
          if (event.touches.length < 2) pinching = false;
          if (scale < 1.08) resetZoom(true);
          return;
        }
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (scale > 1) return;
        if (absX > 45 && absX > absY) {
          deltaX < 0 ? showNext() : showPrev();
        } else if (deltaY > 85 && absY > absX) {
          closeLightbox();
        } else if (absX < 10 && absY < 10) {
          const now = Date.now();
          if (now - lastTap < 300) {
            clearTimeout(tapTimer);
            scale = 2.5;
            applyTransform(true);
            lastTap = 0;
          } else {
            lastTap = now;
            tapTimer = window.setTimeout(toggleControls, 260);
          }
        }
      });

      lbStage.addEventListener('dblclick', event => {
        event.preventDefault();
        scale = scale > 1 ? 1 : 2.5;
        if (scale === 1) translateX = translateY = 0;
        applyTransform(true);
      });
    }

    document.querySelectorAll('[data-open-lightbox]').forEach(trigger => {
      trigger.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openLightbox(trigger.dataset.openLightbox, currentCategory);
      });
    });

    const fullscreenTrigger = document.querySelector('[data-fullscreen-trigger]');
    if (fullscreenTrigger) {
      fullscreenTrigger.addEventListener('click', () => {
        const currentSrc = activeDetailImg ? activeDetailImg.src.split('/').pop() : null;
        openLightbox(
            currentSrc || fullscreenTrigger.dataset.projectCode,
            fullscreenTrigger.dataset.projectCategory);
      });
      fullscreenTrigger.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fullscreenTrigger.click();
        }
      });
    }
  }
})();
