(() => {
  const viewer = document.querySelector('.evidence-viewer');
  if (!viewer || typeof viewer.showModal !== 'function') return;
  const links = [...document.querySelectorAll('[data-evidence]')];
  const image = viewer.querySelector('.evidence-stage img');
  const stage = viewer.querySelector('.evidence-stage');
  const zoom = viewer.querySelector('[data-zoom]');
  const previous = viewer.querySelector('[data-previous]');
  const next = viewer.querySelector('[data-next]');
  let index = 0;
  let opener;
  let priorOverflow;
  const resetZoom = () => {
    stage.classList.remove('is-zoomed');
    zoom.textContent = 'Zoom in';
    zoom.setAttribute('aria-pressed', 'false');
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  };
  const showImage = value => {
    index = (value + links.length) % links.length;
    const link = links[index];
    image.src = link.href;
    image.alt = link.dataset.description;
    viewer.querySelector('#evidence-title').textContent = link.dataset.title;
    viewer.querySelector('#evidence-description').textContent = link.dataset.description;
    viewer.querySelector('#evidence-count').textContent = `Screenshot ${index + 1} of ${links.length}`;
    resetZoom();
  };
  links.forEach((link, i) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    showImage(i);
    priorOverflow = document.body.style.overflow;
    viewer.showModal();
    document.body.style.overflow = 'hidden';
  }));
  zoom.addEventListener('click', () => {
    const zoomed = stage.classList.toggle('is-zoomed');
    zoom.textContent = zoomed ? 'Fit image' : 'Zoom in';
    zoom.setAttribute('aria-pressed', String(zoomed));
    stage.scrollTop = stage.scrollLeft = 0;
  });
  previous.addEventListener('click', () => showImage(index - 1));
  next.addEventListener('click', () => showImage(index + 1));
  viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
  viewer.addEventListener('keydown', event => {
    if (stage.classList.contains('is-zoomed') && document.activeElement === stage) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewer.addEventListener('close', () => {
    document.body.style.overflow = priorOverflow;
    resetZoom();
    opener?.focus({ preventScroll: true });
  });
})();
