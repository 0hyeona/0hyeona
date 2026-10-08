(() => {
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const sections = [...document.querySelectorAll('main > section')];
  const magnetic = [...document.querySelectorAll('.hero__explore-toggle, .works__slide-previous, .works__slide-next, .works__autoplay, .contact__copy')];
  magnetic.forEach((button) => button.classList.add('magnetic-button'));
  let section;
  let button;
  let frame = 0;
  let pending;
  const neutral = (target) => {
    target?.style.removeProperty('--pointer-x');
    target?.style.removeProperty('--pointer-y');
  };
  const reset = () => {
    neutral(section);
    neutral(button);
    section = button = pending = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const paint = () => {
    frame = 0;
    if (!pending || !enabled.matches) return;
    const { target, x, y } = pending;
    const nextSection = target.closest('main > section');
    const nextButton = target.closest('.magnetic-button');
    if (section !== nextSection) neutral(section);
    if (button !== nextButton) neutral(button);
    section = nextSection;
    button = nextButton;
    if (section) {
      section.style.setProperty('--pointer-x', (x / innerWidth * 2 - 1).toFixed(3));
      section.style.setProperty('--pointer-y', (y / innerHeight * 2 - 1).toFixed(3));
    }
    if (button) {
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--pointer-x', Math.max(-1, Math.min(1, (x - rect.left) / rect.width * 2 - 1)).toFixed(3));
      button.style.setProperty('--pointer-y', Math.max(-1, Math.min(1, (y - rect.top) / rect.height * 2 - 1)).toFixed(3));
    }
  };
  document.addEventListener('pointermove', (event) => {
    if (!enabled.matches || event.pointerType !== 'mouse' || event.target.closest('dialog')) {
      reset();
      return;
    }
    pending = { target: event.target, x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', reset, { passive: true });
  enabled.addEventListener('change', () => {
    reset();
    sections.forEach(neutral);
    magnetic.forEach(neutral);
  });
})();
