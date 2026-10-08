(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const toggle = document.querySelector('.hero__explore-toggle');
  const menu = document.querySelector('.hero__menu');
  const sectionMenu = document.querySelector('.section-menu');
  if (sectionMenu) {
    const links = [...sectionMenu.querySelectorAll('a')];
    const sections = links.map((link) => document.querySelector(link.getAttribute('href')));
    let navigationFrame = 0;
    const updateNavigation = () => {
      navigationFrame = 0;
      let active = 0;
      sections.forEach((section, index) => { if (section && section.getBoundingClientRect().top <= 120) active = index; });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) active = sections.length - 1;
      links.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const scheduleNavigation = () => {
      if (!navigationFrame) navigationFrame = requestAnimationFrame(updateNavigation);
    };
    window.addEventListener('scroll', scheduleNavigation, { passive: true });
    window.addEventListener('resize', scheduleNavigation);
    sectionMenu.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      const heading = document.querySelector(link.getAttribute('href'))?.querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    });
    updateNavigation();
  }

  if (toggle && menu) {
    const setMenu = (open, restoreFocus = false) => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      if (restoreFocus) toggle.focus({ preventScroll: true });
    };
    toggle.hidden = false;
    setMenu(false);
    toggle.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      const section = document.querySelector(link.getAttribute('href'));
      const heading = section?.querySelector('h2');
      setMenu(false);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.hero__explore') && !menu.hidden) setMenu(false);
    });
  }

  if ('IntersectionObserver' in window) {
    const items = [...document.querySelectorAll('[data-reveal]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    items.forEach((item) => observer.observe(item));
    document.documentElement.classList.add('reveal-enabled');
    const showAll = () => {
      if (!motion.matches) return;
      items.forEach((item) => item.classList.add('is-revealed'));
      observer.disconnect();
    };
    motion.addEventListener('change', showAll);
    showAll();
  }

  if (hero) {
    let frame = 0;
    let visible = true;
    const paintHero = () => {
      frame = 0;
      if (motion.matches || !visible) return;
      const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / Math.max(1, hero.offsetHeight)));
      hero.style.setProperty('--hero-lift', `${(-progress * .65).toFixed(3)}rem`);
      hero.style.setProperty('--hero-turn', `${(progress * 90).toFixed(2)}deg`);
    };
    const schedule = () => {
      if (!frame && visible && !motion.matches) frame = requestAnimationFrame(paintHero);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      }).observe(hero);
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', () => {
      hero.style.removeProperty('--hero-lift');
      hero.style.removeProperty('--hero-turn');
      schedule();
    });
    schedule();
  }

  const copy = document.querySelector('.contact__copy');
  const status = document.querySelector('.contact__status');
  const email = document.querySelector('.contact__email-text');
  if (copy && status && email) {
    let timer;
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const address = email.textContent.trim();
      clearTimeout(timer);
      delete copy.dataset.copied;
      copy.textContent = '이메일 복사';
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(address);
          copied = true;
        }
      } catch { /* Try the user-initiated fallback below. */ }
      if (!copied) {
        const field = document.createElement('textarea');
        field.value = address;
        field.readOnly = true;
        field.className = 'sr-only';
        document.body.append(field);
        field.select();
        try { copied = document.execCommand('copy'); } catch { copied = false; }
        field.remove();
        copy.focus({ preventScroll: true });
      }
      if (copied) {
        copy.dataset.copied = '';
        copy.textContent = '복사 완료 ✓';
        status.textContent = '이메일 주소를 복사했어요.';
        timer = setTimeout(() => {
          delete copy.dataset.copied;
          copy.textContent = '이메일 복사';
          status.textContent = '';
        }, 3000);
      } else {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(email);
        selection?.removeAllRanges();
        selection?.addRange(range);
        status.textContent = '이메일 주소를 선택했어요. 직접 복사해 주세요.';
      }
    });
  }
})();
