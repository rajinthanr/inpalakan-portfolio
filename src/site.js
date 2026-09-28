(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.gallery-grid .project-card')];
  const count = document.querySelector('#visible-count');

  function selectCategory(category, updateUrl = false) {
    if (!filters.length) return;
    const selected = filters.some(button => button.dataset.filter === category) ? category : 'all';
    let visible = 0;
    filters.forEach(button => {
      const active = button.dataset.filter === selected;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => {
      const show = selected === 'all' || card.dataset.category === selected;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (selected === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', selected);
      history.replaceState(null, '', url);
    }
  }

  filters.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.filter, true)));
  selectCategory(new URLSearchParams(window.location.search).get('category') || 'all');

  document.querySelectorAll('[data-whatsapp-code]').forEach(link => {
    const code = link.dataset.whatsappCode;
    const target = new URL(link.href);
    target.searchParams.set('text', `Hello Inpalakan Timbers, I like design ${code}. Could we discuss something similar for my space? ${window.location.href}`);
    link.href = target.href;
  });

  document.querySelectorAll('[data-share]').forEach(button => button.addEventListener('click', async () => {
    const title = `${button.dataset.title} · Inpalakan Timbers`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        const label = button.querySelector('span');
        if (label) {
          label.textContent = 'Link copied';
          window.setTimeout(() => { label.textContent = 'Share design'; }, 2500);
        }
      } else {
        window.prompt('Copy this design link:', url);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Could not share this design', error);
    }
  }));
})();
