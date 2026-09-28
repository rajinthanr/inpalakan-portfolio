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
  const activeCaption = document.querySelector('#active-view-caption');

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
      if (activeCaption && btn.dataset.viewLabel) {
        activeCaption.textContent = ` (${btn.dataset.viewLabel})`;
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

  // Fullscreen Lightbox & Slider Engine
  const lightboxModal = document.querySelector('#fullscreen-lightbox');
  const playlistEl = document.querySelector('#catalog-playlist');

  if (lightboxModal && playlistEl) {
    let fullPlaylist = [];
    try {
      fullPlaylist = JSON.parse(playlistEl.textContent);
    } catch (e) {
      console.error('Failed to parse catalog playlist', e);
    }

    let activePlaylist = fullPlaylist;
    let currentIndex = 0;

    const lbImg = lightboxModal.querySelector('#lb-image');
    const lbCode = lightboxModal.querySelector('#lb-code');
    const lbCounter = lightboxModal.querySelector('#lb-counter');
    const lbCaption = lightboxModal.querySelector('#lb-caption');
    const lbCategory = lightboxModal.querySelector('#lb-category');
    const lbDetailsLink = lightboxModal.querySelector('#lb-details-link');
    const lbWhatsappBtn = lightboxModal.querySelector('#lb-whatsapp-btn');
    const lbPrevBtn = lightboxModal.querySelector('#lb-prev-btn');
    const lbNextBtn = lightboxModal.querySelector('#lb-next-btn');
    const lbCloseBtn = lightboxModal.querySelector('#lb-close-btn');
    const lbStage = lightboxModal.querySelector('.lightbox-stage');
    const lbBackdrop = lightboxModal.querySelector('.lightbox-backdrop');

    function preloadAdjacent() {
      if (!activePlaylist.length) return;
      const nextIdx = (currentIndex + 1) % activePlaylist.length;
      const prevIdx =
          (currentIndex - 1 + activePlaylist.length) % activePlaylist.length;
      new Image().src = activePlaylist[nextIdx].src;
      new Image().src = activePlaylist[prevIdx].src;
    }

    function renderSlide(direction = '') {
      if (!activePlaylist.length) return;
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
      lbCounter.textContent = `${currentIndex + 1} of ${activePlaylist.length}`;
      lbCaption.textContent =
          item.label ? `${item.title} (${item.label})` : item.title;
      lbCategory.textContent = (item.category || '').toUpperCase();

      if (lbDetailsLink) {
        lbDetailsLink.href = item.url;
      }

      if (lbWhatsappBtn) {
        const fullUrl = new URL(item.whatsapp);
        const itemPageUrl = new URL(item.url, window.location.href).href;
        const msg =
            `Hello Inpalakan Timbers, I am interested in design ${item.code} (${
                item.label ||
                'full view'}) from your portfolio: ${itemPageUrl}`;
        fullUrl.searchParams.set('text', msg);
        lbWhatsappBtn.href = fullUrl.href;
      }

      preloadAdjacent();
    }

    function showNext() {
      if (activePlaylist.length <= 1) return;
      currentIndex = (currentIndex + 1) % activePlaylist.length;
      renderSlide('next');
    }

    function showPrev() {
      if (activePlaylist.length <= 1) return;
      currentIndex =
          (currentIndex - 1 + activePlaylist.length) % activePlaylist.length;
      renderSlide('prev');
    }

    function openLightbox(startSrcOrCode, categoryFilter = null) {
      if (categoryFilter && categoryFilter !== 'all') {
        const filtered =
            fullPlaylist.filter(p => p.category === categoryFilter);
        activePlaylist = filtered.length ? filtered : fullPlaylist;
      } else {
        activePlaylist = fullPlaylist;
      }

      if (!activePlaylist.length) return;

      let targetIndex = -1;
      if (startSrcOrCode) {
        const query = startSrcOrCode.toLowerCase();
        targetIndex = activePlaylist.findIndex(
            item => item.src.toLowerCase().endsWith(query) ||
                (item.rawSrc && item.rawSrc.toLowerCase() === query));
        if (targetIndex === -1) {
          targetIndex = activePlaylist.findIndex(
              item => item.code.toLowerCase() === query);
        }
      }

      currentIndex = targetIndex >= 0 ? targetIndex : 0;
      lightboxModal.hidden = false;
      requestAnimationFrame(() => {
        lightboxModal.classList.add('is-open');
        document.body.classList.add('lightbox-open');
      });
      renderSlide();
    }

    function closeLightbox() {
      lightboxModal.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      window.setTimeout(() => {
        if (!lightboxModal.classList.contains('is-open')) {
          lightboxModal.hidden = true;
        }
      }, 250);
    }

    if (lbNextBtn)
      lbNextBtn.addEventListener('click', e => {
        e.stopPropagation();
        showNext();
      });
    if (lbPrevBtn)
      lbPrevBtn.addEventListener('click', e => {
        e.stopPropagation();
        showPrev();
      });
    if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeLightbox);
    if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

    // Keyboard controls
    window.addEventListener('keydown', e => {
      if (!lightboxModal.classList.contains('is-open')) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        showNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      }
    });

    // Touch Swipe gestures for phones
    if (lbStage) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchDeltaX = 0;
      let touchDeltaY = 0;

      lbStage.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchDeltaX = 0;
          touchDeltaY = 0;
        }
      }, {passive: true});

      lbStage.addEventListener('touchmove', e => {
        if (e.touches.length === 1) {
          touchDeltaX = e.touches[0].clientX - touchStartX;
          touchDeltaY = e.touches[0].clientY - touchStartY;
        }
      }, {passive: true});

      lbStage.addEventListener('touchend', e => {
        const absX = Math.abs(touchDeltaX);
        const absY = Math.abs(touchDeltaY);

        if (absX > 35 && absX > absY) {
          if (touchDeltaX < 0) {
            showNext();
          } else {
            showPrev();
          }
        } else if (absY > 75 && absY > absX) {
          closeLightbox();
        }
      });
    }

    // Connect Gallery Card expand buttons
    document.querySelectorAll('[data-open-lightbox]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(btn.dataset.openLightbox, currentCategory);
      });
    });

    // Connect Project Page Main Image Click ("Click again to view full screen")
    const fullscreenTrigger =
        document.querySelector('[data-fullscreen-trigger]');
    if (fullscreenTrigger) {
      fullscreenTrigger.addEventListener('click', () => {
        const cat = fullscreenTrigger.dataset.projectCategory;
        const currentSrc =
            activeDetailImg ? activeDetailImg.src.split('/').pop() : null;
        openLightbox(currentSrc || fullscreenTrigger.dataset.projectCode, cat);
      });

      fullscreenTrigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fullscreenTrigger.click();
        }
      });
    }
  }
})();
