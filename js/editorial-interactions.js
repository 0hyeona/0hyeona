(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const canFollow = () => finePointer.matches && !reduced.matches;

  // Preserve the original text and emphasis, using the authored line breaks.
  document.querySelectorAll('.about__title, .contact__title').forEach((heading) => {
    if (heading.querySelector('.editorial-line')) return;
    const lines = [[]];
    [...heading.childNodes].forEach((node) => {
      if (node.nodeName === 'BR') lines.push([]);
      else lines.at(-1).push(node);
    });
    if (lines.length < 2) return;
    const fragment = document.createDocumentFragment();
    lines.forEach((nodes, index) => {
      const line = document.createElement('span');
      const inner = document.createElement('span');
      line.className = 'editorial-line';
      inner.className = 'editorial-line__inner';
      line.style.setProperty('--line-index', index);
      inner.append(...nodes);
      if (heading.matches('.about__title') && index === lines.length - 1) {
        const ink = document.createElement('span');
        ink.className = 'editorial-ink';
        ink.append(...inner.childNodes);
        inner.append(ink);
      }
      line.append(inner);
      fragment.append(line);
      if (index < lines.length - 1) fragment.append(document.createTextNode(' '));
    });
    heading.replaceChildren(fragment);
  });

  const navigation = document.querySelector('.section-menu');
  let progressFrame = 0;
  const paintProgress = () => {
    progressFrame = 0;
    if (!navigation) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    navigation.style.setProperty('--reading-progress', String(max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0));
  };
  const scheduleProgress = () => {
    if (!progressFrame) progressFrame = requestAnimationFrame(paintProgress);
  };
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleProgress).observe(document.body);
  scheduleProgress();

  const word = document.querySelector('.hero__elastic-word');
  const letters = [...document.querySelectorAll('.hero__letter')];
  const stage = document.querySelector('.works__grid');
  let artwork = null;
  let lettersActive = false;
  let pointerFrame = 0;
  let pendingPointer = null;
  const resetArtwork = () => {
    artwork?.style.removeProperty('--art-x');
    artwork?.style.removeProperty('--art-y');
    artwork?.classList.remove('is-art-hovered');
    artwork = null;
  };
  const resetLetters = () => {
    if (!lettersActive) return;
    letters.forEach((letter) => {
      letter.style.removeProperty('--letter-near');
      letter.style.removeProperty('--letter-lean');
    });
    lettersActive = false;
  };
  const resetPointer = () => {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pendingPointer = null;
    resetArtwork();
    resetLetters();
  };
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  const paintPointer = () => {
    pointerFrame = 0;
    if (!pendingPointer || !canFollow()) return;
    const { target, x, y } = pendingPointer;
    if (word?.contains(target)) {
      const rect = word.getBoundingClientRect();
      const position = (x - rect.left) / Math.max(1, rect.width) * letters.length;
      letters.forEach((letter, index) => {
        const delta = index + .5 - position;
        const near = Math.max(0, 1 - Math.abs(delta) / 2.2);
        letter.style.setProperty('--letter-near', near.toFixed(3));
        letter.style.setProperty('--letter-lean', (clamp(delta) * near).toFixed(3));
      });
      lettersActive = true;
    } else resetLetters();
    const next = target.closest('.works__card[data-center="true"] .works__open');
    if (next !== artwork) resetArtwork();
    artwork = next;
    if (artwork) {
      const rect = artwork.getBoundingClientRect();
      artwork.style.setProperty('--art-x', clamp((x - rect.left) / Math.max(1, rect.width) * 2 - 1).toFixed(3));
      artwork.style.setProperty('--art-y', clamp((y - rect.top) / Math.max(1, rect.height) * 2 - 1).toFixed(3));
      artwork.classList.add('is-art-hovered');
    }
  };
  document.addEventListener('pointermove', (event) => {
    if (!canFollow() || event.pointerType !== 'mouse' || event.target.closest('dialog')) {
      resetPointer();
      return;
    }
    pendingPointer = { target: event.target, x: event.clientX, y: event.clientY };
    if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetPointer);
  window.addEventListener('blur', resetPointer);
  window.addEventListener('scroll', resetPointer, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetPointer(); });

  // The carousel owns the outer transform; category reveals animate its inner button.
  const animations = new Set();
  const cancelAnimations = () => { animations.forEach((animation) => animation.cancel()); animations.clear(); };
  let category = stage?.dataset.filter;
  document.querySelectorAll('.works__filters [data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = stage?.dataset.filter;
      if (!stage || next === category) return;
      category = next;
      resetPointer();
      cancelAnimations();
      if (reduced.matches || !Element.prototype.animate) return;
      const cards = [...stage.querySelectorAll('.works__card:not([hidden])[data-on-stage="true"]')];
      cards.sort((a, b) => Number(b.dataset.center === 'true') - Number(a.dataset.center === 'true'));
      cards.forEach((card, index) => {
        const surface = card.querySelector('.works__open');
        if (!surface) return;
        const animation = surface.animate([
          { opacity: 0, clipPath: 'inset(0 0 100% 0)', translate: '0 12px' },
          { opacity: 1, clipPath: 'inset(0 0 0% 0)', translate: '0 0' },
        ], { duration: 600, delay: index * 45, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
      });
    });
  });
  reduced.addEventListener('change', () => { resetPointer(); cancelAnimations(); });
  finePointer.addEventListener('change', resetPointer);
})();
