(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.gallery-grid .project-card')];
  const count = document.querySelector('#visible-count');
  const searchInput = document.querySelector('[data-gallery-search]');
  const emptyState = document.querySelector('.empty-state');
  let currentCategory = 'all';
  let currentQuery = '';

  function applyFilters() {
    let visible = 0;
    cards.forEach(card => {
      const matchCat = currentCategory === 'all' ||
          card.dataset.category === currentCategory;
      const matchQuery = !currentQuery ||
          card.textContent.toLowerCase().includes(currentQuery);
      const show = matchCat && matchQuery;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (emptyState) emptyState.hidden = visible > 0;
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

  document.querySelectorAll('[data-whatsapp-code]').forEach(link => {
    const code = link.dataset.whatsappCode;
    const target = new URL(link.href);
    target.searchParams.set(
        'text',
        `Hello Inpalakan Timbers, I like design ${
            code}. Could we discuss something similar for my space? ${
            window.location.href}`);
    link.href = target.href;
  });

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
})();
