(() => {
  const openingHero = document.querySelector('.opening-hero');
  const siteHeader = document.querySelector('.site-header');
  if (openingHero && siteHeader) {
    const measureHeader = () => {
      openingHero.style.setProperty('--header-height', `${siteHeader.getBoundingClientRect().height}px`);
    };
    measureHeader();
    if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(siteHeader);
    else window.addEventListener('resize', measureHeader);
  }
  const contents = document.querySelector('.submission-contents');
  if (contents) {
    const sidebarLayout = window.matchMedia('(min-width: 951px)');
    const entries = Array.from(contents.querySelectorAll('a[href^="#"]'))
      .map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
      .filter(entry => entry.section);
    let scheduled = false;
    const updateContents = () => {
      scheduled = false;
      if (!sidebarLayout.matches) {
        for (const entry of entries) entry.link.removeAttribute('aria-current');
        return;
      }
      const readingLine = Math.min(window.innerHeight * 0.25, 160);
      let active = entries[0];
      for (const entry of entries) {
        if (entry.section.getBoundingClientRect().top <= readingLine) active = entry;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        active = entries[entries.length - 1];
      }
      for (const entry of entries) {
        if (entry === active) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      }
    };
    const scheduleUpdate = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateContents);
      }
    };
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    sidebarLayout.addEventListener('change', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);
    updateContents();
  }
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
