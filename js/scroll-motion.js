(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;

  // Reveal individual pieces so long sections never disappear as one block.
  document.querySelectorAll('[data-reveal]').forEach((item) => item.removeAttribute('data-reveal'));
  const groups = [
    ['.about__photo', 'portrait'],
    ['.about__kicker, .about__title, .about__description, .about__details > section', 'rise'],
    ['.tools__item', 'tool'],
    ['.works__intro, .works__filters', 'rise'],
    ['.works__exhibition', 'gallery'],
    ['.web-projects__intro, .project-showcase__intro, .project-showcase__preview', 'rise'],
    ['.contact__kicker, .contact__title, .contact__description, .contact__email-row, .contact__links', 'rise'],
    ['.about__top, .tools__top, .works__top, .contact__top', 'rule'],
  ];
  const items = [];
  groups.forEach(([selector, type]) => {
    document.querySelectorAll(selector).forEach((item) => {
      item.dataset.motion = type;
      items.push(item);
    });
  });
  // Give every group the same left-to-right timing at each responsive width.
  const syncToolDelays = () => {
    document.querySelectorAll('.tools__list').forEach((list) => {
      const rowCounts = new Map();
      [...list.children].forEach((item) => {
        const row = item.offsetTop;
        const column = rowCounts.get(row) || 0;
        item.style.setProperty('--motion-delay', `${column * 65}ms`);
        rowCounts.set(row, column + 1);
      });
    });
  };
  syncToolDelays();
  window.addEventListener('resize', syncToolDelays);

  const title = document.querySelector('.hero__title');
  const hero = document.querySelector('.hero');
  if (title) {
    const textNode = [...title.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) {
      const word = document.createElement('span');
      word.className = 'hero__elastic-word';
      word.setAttribute('aria-hidden', 'true');
      [...textNode.textContent.trim()].forEach((letter, index) => {
        const span = document.createElement('span');
        span.className = 'hero__letter';
        span.textContent = letter;
        span.style.setProperty('--letter-index', index);
        word.append(span);
      });
      title.setAttribute('aria-label', title.textContent.trim());
      textNode.replaceWith(word);
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('motion-entered');
      observer.unobserve(target);
    });
  }, { threshold: .01, rootMargin: '0px 0px 4% 0px' });
  items.forEach((item) => observer.observe(item));

  const active = new Set();
  const sections = [...document.querySelectorAll('main > section')];
  const anchors = new Map();
  sections.forEach((section, index) => {
    const anchor = document.createElement('div');
    anchor.className = 'section-scroll-anchor';
    anchor.setAttribute('aria-hidden', 'true');
    section.before(anchor);
    anchors.set(section.id, anchor);
    section.style.setProperty('--sheet-order', index + 1);
  });
  const updateSheets = () => {
    const menuHeight = document.querySelector('.section-menu')?.offsetHeight || 0;
    sections.forEach((section) => {
      // Pin a long section only once its last content has reached the viewport.
      const top = section === hero ? 0 : Math.min(menuHeight, innerHeight - section.offsetHeight);
      section.style.setProperty('--sheet-top', `${top}px`);
    });
  };
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(updateSheets);
    sections.forEach((section) => resizeObserver.observe(section));
    const menu = document.querySelector('.section-menu');
    if (menu) resizeObserver.observe(menu);
  }
  window.addEventListener('resize', updateSheets);
  // Sticky coordinates change while scrolling; navigate to a normal-flow anchor.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.section-menu a, .hero__menu a');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = link.getAttribute('href')?.slice(1);
    const anchor = anchors.get(id);
    if (!anchor) return;
    event.preventDefault();
    const menuHeight = document.querySelector('.section-menu')?.offsetHeight || 0;
    const top = anchor.getBoundingClientRect().top + scrollY - menuHeight;
    history.pushState(null, '', `#${id}`);
    window.scrollTo({ top, behavior: preference.matches ? 'instant' : 'smooth' });
  });

  let intro;
  if (!preference.matches && !location.hash && scrollY < 20) {
    intro = document.createElement('div');
    intro.className = 'landing-curtain';
    intro.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = 'HYEONA’S PORTFOLIO';
    intro.append(label);
    document.body.append(intro);
    hero?.style.setProperty('--hero-entry-delay', '2.55s');
    document.documentElement.classList.add('landing-opening');
    const finishIntro = () => {
      intro?.remove();
      document.documentElement.classList.remove('landing-opening');
    };
    intro.addEventListener('animationend', (event) => {
      if (event.target === intro) finishIntro();
    });
    setTimeout(finishIntro, 3600);
  }
  let frame = 0;
  const paint = () => {
    frame = 0;
    if (preference.matches) return;
    active.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      section.style.setProperty('--scroll-progress', progress.toFixed(4));
    });
  };
  const schedule = () => {
    if (!frame && !preference.matches && active.size) frame = requestAnimationFrame(paint);
  };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) active.add(target);
      else active.delete(target);
      if (target === hero) target.classList.toggle('hero-bouncing', isIntersecting && !preference.matches);
    });
    schedule();
  });
  sections.forEach((section) => sectionObserver.observe(section));
  const syncPreference = () => {
    document.documentElement.classList.toggle('scroll-motion', !preference.matches);
    document.documentElement.classList.toggle('stacked-sections', !preference.matches);
    updateSheets();
    if (preference.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      items.forEach((item) => item.classList.add('motion-entered'));
      hero?.classList.remove('hero-bouncing');
      intro?.remove();
      document.documentElement.classList.remove('landing-opening');
      sections.forEach((section) => section.style.removeProperty('--scroll-progress'));
    } else {
      hero?.classList.toggle('hero-bouncing', active.has(hero));
      schedule();
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  // Keyboard focus must reveal its content immediately, even before scrolling.
  document.addEventListener('focusin', (event) => {
    event.target.closest('[data-motion]')?.classList.add('motion-entered');
  });
  preference.addEventListener('change', syncPreference);
  syncPreference();
})();
