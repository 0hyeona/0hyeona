(() => {
  const section = document.querySelector('.works');
  if (!section) return;
  const filters = [...section.querySelectorAll('[data-filter]')];
  const cards = [...section.querySelectorAll('.works__card')];
  const dialog = section.querySelector('.works__dialog');
  const full = section.querySelector('.works__full');
  const title = section.querySelector('#works-dialog-title');
  const categoryText = section.querySelector('.works__dialog-category');
  const description = section.querySelector('.works__dialog-description');
  const previous = section.querySelector('.works__previous');
  const next = section.querySelector('.works__next');
  const position = section.querySelector('.works__position');
  const dialogNavigation = section.querySelector('.works__dialog-navigation');
  if (dialog && dialogNavigation) dialog.append(dialogNavigation);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const track = section.querySelector('.works__grid');
  const controls = section.querySelector('.works__gallery-controls');
  const slidePrevious = section.querySelector('.works__slide-previous');
  const slideNext = section.querySelector('.works__slide-next');
  const autoplay = section.querySelector('.works__autoplay');
  const exhibitPosition = section.querySelector('.works__gallery-position');
  let activeFilter = null;
  let displayed = [];
  let selected = 0;
  let gallery = [];
  let currentIndex = 0;
  let opener = null;
  let previousOverflow = '';
  let scrollLocked = false;
  let playing = !reducedMotion.matches;
  let hovering = false;
  let onScreen = false;
  let timer;
  let touchStart = null;
  let posterFrame = 0;
  let posterTime = 0;
  let posterCycle = 0;
  filters.forEach(button => {
    const count = document.createElement('span');
    count.className = 'works__filter-count';
    count.textContent = cards.filter(card => card.dataset.category === button.dataset.filter).length;
    button.append(count);
  });
  cards.forEach((card, index) => { card.dataset.workIndex = index; });

  function renderExhibition(announce = false) {
    if (!track || !displayed.length) return;
    if (activeFilter === 'detail') return;
    if (activeFilter === 'poster') {
      const clone = track.querySelector('[data-clone]');
      posterCycle = clone ? clone.offsetLeft - displayed[0].offsetLeft : 0;
      updatePosition(announce);
      return;
    }
    const width = displayed[0].offsetWidth;
    const spacing = width * (activeFilter === 'banner' ? 1.06 : 1.15);
    displayed.forEach((card, index) => {
      let offset = (index - selected + displayed.length) % displayed.length;
      if (offset > displayed.length / 2) offset -= displayed.length;
      const visible = Math.abs(offset) <= 2;
      const slot = Math.max(-3, Math.min(3, offset));
      card.dataset.onStage = String(visible);
      card.dataset.center = String(offset === 0);
      card.style.setProperty('--exhibit-x', (slot * spacing) + 'px');
      card.style.setProperty('--exhibit-y', (activeFilter === 'banner' ? 0 : Math.abs(slot) * Math.abs(slot) * 18) + 'px');
      card.style.setProperty('--exhibit-turn', (activeFilter === 'banner' ? 0 : slot * 10) + 'deg');
      card.style.setProperty('--exhibit-scale', String(1 - Math.abs(slot) * (activeFilter === 'banner' ? .04 : .12)));
      card.style.zIndex = String(10 - Math.abs(slot));
      // Keep clipped side cards out of the tab order; pointer clicks still work.
      const openButton = card.querySelector('.works__open');
      if (openButton) openButton.tabIndex = offset === 0 ? 0 : -1;
      card.inert = !visible;
      card.setAttribute('aria-hidden', String(!visible));
    });
    const height = Math.max(...displayed.map((card) => card.offsetHeight)) + 72;
    track.style.setProperty('--exhibit-stage-height', height + 'px');
    updatePosition(announce);
  }

  function updatePosition(announce = false) {
    if (!exhibitPosition) return;
    exhibitPosition.setAttribute('aria-live', announce ? 'polite' : 'off');
    exhibitPosition.textContent = String(selected + 1).padStart(2, '0') + ' / ' + String(displayed.length).padStart(2, '0');
  }

  function canPlay() {
    return activeFilter !== 'detail' && (activeFilter === 'poster' ? !reducedMotion.matches : playing) && onScreen && !hovering && !document.hidden && !dialog?.open &&
      !track?.contains(document.activeElement) && displayed.length > 1;
  }

  function wakeExhibition() {
    clearTimeout(timer);
    cancelAnimationFrame(posterFrame);
    posterFrame = 0;
    posterTime = 0;
    if (!canPlay()) return;
    if (activeFilter === 'poster') {
      let posterOffset = track.scrollLeft;
      const drift = (time) => {
        if (!canPlay() || activeFilter !== 'poster') return;
        const elapsed = posterTime ? Math.min(time - posterTime, 50) : 0;
        posterTime = time;
        if (posterCycle > 0) {
          posterOffset = (posterOffset + elapsed * .025) % posterCycle;
          track.scrollLeft = posterOffset;
          syncPosterPosition();
        }
        posterFrame = requestAnimationFrame(drift);
      };
      posterFrame = requestAnimationFrame(drift);
      return;
    }
    timer = setTimeout(() => {
      if (canPlay()) {
        selected = (selected + 1) % displayed.length;
        renderExhibition();
      }
      wakeExhibition();
    }, 3200);
  }

  function updatePlayback() {
    autoplay?.setAttribute('aria-pressed', String(playing));
    if (autoplay) autoplay.textContent = playing ? '자동 재생 멈추기' : '자동 재생 시작';
  }

  function stepExhibition(direction) {
    if (displayed.length < 2) return;
    selected = (selected + direction + displayed.length) % displayed.length;
    if (activeFilter === 'poster') {
      track.scrollTo({left: displayed[selected].offsetLeft - displayed[0].offsetLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
      updatePosition(true);
    } else renderExhibition(true);
    wakeExhibition();
  }

  function filter(category) {
    if (!filters.some((button) => button.dataset.filter === category) || category === activeFilter) return;
    activeFilter = category;
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    track.querySelectorAll('[data-clone]').forEach(clone => clone.remove());
    track.scrollLeft = 0;
    posterCycle = 0;
    cards.forEach((card) => {
      card.hidden = card.dataset.category !== category;
      card.inert = false;
      card.removeAttribute('aria-hidden');
      card.removeAttribute('data-on-stage');
      card.removeAttribute('data-center');
      card.removeAttribute('style');
      card.querySelector('.works__open').tabIndex = 0;
    });
    displayed = cards.filter((card) => !card.hidden);
    displayed.forEach((card, index) => {
      card.querySelector('img').loading = 'eager';
      card.dataset.posterRaised = String(index % 2 === 1);
    });
    selected = 0;
    if (track && controls) {
      track.dataset.filter = category;
      track.classList.toggle('is-exhibition', category === 'popup' || category === 'banner');
      track.classList.toggle('is-banner', category === 'banner');
      track.classList.toggle('is-poster', category === 'poster');
      track.classList.toggle('is-detail', category === 'detail');
      track.style.removeProperty('--exhibit-stage-height');
      controls.hidden = category === 'detail' || category === 'poster';
      if (category === 'poster') {
        displayed.forEach(card => {
          const clone = card.cloneNode(true);
          clone.dataset.clone = 'true';
          clone.setAttribute('aria-hidden', 'true');
          clone.querySelector('.works__open').tabIndex = -1;
          track.append(clone);
        });
      }
      slidePrevious.disabled = slideNext.disabled = displayed.length < 2;
      autoplay.disabled = displayed.length < 2;
      renderExhibition();
      updatePlayback();
      wakeExhibition();
    }
  }


  function syncPosterPosition() {
    if (activeFilter !== 'poster' || !posterCycle) return;
    const offset = track.scrollLeft % posterCycle;
    let closest = 0;
    displayed.forEach((card, index) => {
      if (card.offsetLeft - displayed[0].offsetLeft <= offset + card.offsetWidth / 2) closest = index;
    });
    if (closest !== selected) { selected = closest; updatePosition(); }
  }

  filters.forEach((button) => button.addEventListener('click', () => filter(button.dataset.filter)));
  slidePrevious?.addEventListener('click', () => stepExhibition(-1));
  slideNext?.addEventListener('click', () => stepExhibition(1));
  autoplay?.addEventListener('click', () => { playing = !playing; updatePlayback(); wakeExhibition(); });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) playing = false;
    updatePlayback();
    wakeExhibition();
  });
  if (track) {
    track.addEventListener('scroll', syncPosterPosition, {passive: true});
    track.addEventListener('load', (event) => {
      if (event.target.matches('img')) renderExhibition();
    }, true);
    track.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') { hovering = true; wakeExhibition(); } });
    track.addEventListener('pointerleave', () => { hovering = false; wakeExhibition(); });
    track.addEventListener('focusin', wakeExhibition);
    track.addEventListener('focusout', () => requestAnimationFrame(wakeExhibition));
    track.addEventListener('keydown', (event) => {
      if (activeFilter === 'detail') return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      stepExhibition(event.key === 'ArrowLeft' ? -1 : 1);
      displayed[selected]?.querySelector('.works__open')?.focus({ preventScroll: true });
    });
    track.addEventListener('touchstart', (event) => { if (activeFilter === 'poster') { hovering = true; wakeExhibition(); return; } if (activeFilter === 'detail') return; touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }, { passive: true });
    track.addEventListener('touchend', (event) => {
      if (activeFilter === 'poster') { hovering = false; wakeExhibition(); return; }
      if (!touchStart) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) stepExhibition(dx < 0 ? 1 : -1);
    }, { passive: true });
    track.addEventListener('touchcancel', () => { touchStart = null; hovering = false; wakeExhibition(); }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; wakeExhibition(); }).observe(track);
    } else { onScreen = true; }
    window.addEventListener('resize', () => renderExhibition());
    document.addEventListener('visibilitychange', wakeExhibition);
  }
  filter('popup');

  if (!dialog || !full || !title || typeof dialog.showModal !== 'function') return;

  function renderWork() {
    const card = gallery[currentIndex];
    const image = card?.querySelector('img');
    if (!card || !image) return;
    full.src = image.currentSrc || image.src;
    full.alt = image.alt;
    dialog.dataset.category = card.dataset.category;
    title.textContent = card.querySelector('h3')?.textContent.trim() || image.alt;
    if (categoryText) categoryText.textContent = card.querySelector('.works__category')?.textContent.trim() || '';
    if (description) description.textContent = card.querySelector('.works__description')?.textContent.trim() || '';
    if (position) position.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(gallery.length).padStart(2, '0');
    if (previous) previous.disabled = gallery.length < 2;
    if (next) next.disabled = gallery.length < 2;
    dialog.scrollTop = 0;
    const dialogBody = dialog.querySelector('.works__dialog-body');
    if (dialogBody) dialogBody.scrollTop = 0;
  }

  function navigate(direction) {
    if (!dialog.open || gallery.length < 2) return;
    currentIndex = (currentIndex + direction + gallery.length) % gallery.length;
    renderWork();
  }

  track?.addEventListener('click', (event) => {
      const button = event.target.closest('.works__open');
      if (!button) return;
      const card = cards[Number(button.closest('.works__card').dataset.workIndex)];
      if (dialog.open) return;
      gallery = cards.filter((item) => !item.hidden);
      currentIndex = gallery.indexOf(card);
      if (currentIndex < 0) return;
      opener = card.querySelector('.works__open');
      renderWork();
      dialog.showModal();
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      scrollLocked = true;
  });

  previous?.addEventListener('click', () => navigate(-1));
  next?.addEventListener('click', () => navigate(1));
  section.querySelector('.works__close')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.matches('input, textarea, select'))) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    if (scrollLocked) {
      document.body.style.overflow = previousOverflow;
      scrollLocked = false;
    }
    if (opener?.isConnected && !opener.closest('[hidden]')) opener.focus({ preventScroll: true });
    opener = null;
    gallery = [];
    wakeExhibition();
  });
})();
