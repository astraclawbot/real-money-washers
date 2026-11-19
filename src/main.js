(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    const header = toggle.closest('.site-header');
    header.classList.add('menu-enhanced');
    toggle.hidden = false;
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
      nav.classList.remove('is-open');
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      nav.classList.toggle('is-open', open);
    });
    header.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        toggle.focus();
      }
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);
  }
  const comparison = document.querySelector('[data-comparison-image]');
  if (comparison) {
    document.querySelector('.comparison-controls').hidden = false;
    const states = {
      before: {
        source: 'assets/inspection-before.webp',
        alt: 'A fictional banknote with visible surface marks before its wash',
        caption: 'Before treatment: visible surface marks and everyday pocket wear.'
      },
      after: {
        source: 'assets/inspection-after.webp',
        alt: 'A freshly washed fictional banknote resting in a glass inspection tray',
        caption: 'After treatment: surface marks removed, character retained.'
      }
    };
    document.querySelectorAll('[data-compare]').forEach(button => {
      button.addEventListener('click', () => {
        const state = states[button.dataset.compare];
        if (!state) return;
        comparison.src = state.source;
        comparison.alt = state.alt;
        document.querySelectorAll('[data-compare]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
        document.querySelector('[data-comparison-caption]').textContent = state.caption;
      });
    });
  }
})();
