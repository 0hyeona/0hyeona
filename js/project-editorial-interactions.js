(() => {
  const page = document.querySelector('.project-page');
  const bar = document.querySelector('.page-bar');
  if (!page || !bar) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const links = [...bar.querySelectorAll('nav a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  const progress = document.createElement('span');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  bar.append(progress);

  let scheduled = false;
  function updateReading() {
    scheduled = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1})`;
    const threshold = bar.getBoundingClientRect().bottom + 100;
    let current = -1;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= threshold) current = index;
    });
    if (max > 0 && scrollY >= max - 2) current = sections.length - 1;
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    document.documentElement.style.setProperty('--project-nav-height', `${bar.offsetHeight + 24}px`);
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateReading);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  if ('ResizeObserver' in window) {
    const sizes = new ResizeObserver(schedule);
    sizes.observe(bar);
    sizes.observe(document.querySelector('main'));
  }
  updateReading();

  const reveals = [...document.querySelectorAll('.hero-copy > *, .cover, .overview > *, .design-direction, .signature-grid, .logo-section, .color-copy, .color-strip, .type-section > *, .persona-profile, .persona-needs > div, .journey > div, .phone-line, #responsive > h2')];
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        observer.unobserve(target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach(item => {
      // Only animate upcoming content, avoiding a flash in the initial viewport.
      if (item.getBoundingClientRect().top < innerHeight) return;
      item.classList.add('project-reveal');
      observer.observe(item);
    });
    const showFocused = event => event.target.closest('.project-reveal')?.classList.add('is-visible');
    document.addEventListener('focusin', showFocused);
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        reveals.forEach(item => item.classList.add('is-visible'));
        observer.disconnect();
      }
    });
  }

  const status = document.createElement('p');
  status.className = 'project-feedback';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  page.append(status);
  let feedbackTimer;
  function announce(text) {
    clearTimeout(feedbackTimer);
    status.textContent = text;
    status.classList.add('is-shown');
    feedbackTimer = setTimeout(() => status.classList.remove('is-shown'), 1800);
  }
  document.querySelectorAll('.color-strip li').forEach(item => {
    const code = item.querySelector('strong')?.textContent.trim();
    if (!code) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch-button';
    button.setAttribute('aria-label', `${code} 색상 코드 복사`);
    const preview = document.createElement('span');
    preview.className = 'swatch-preview';
    preview.setAttribute('aria-hidden', 'true');
    button.append(preview, ...item.childNodes);
    item.append(button);
    item.classList.add('is-interactive');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        announce(`${code} 복사했어요`);
      } catch {
        announce(`색상 코드: ${code}`);
      }
    });
  });
})();
