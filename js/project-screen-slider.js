document.querySelectorAll('.project-screen-slider').forEach(slider => {
  const buttons = [...slider.querySelectorAll('[data-screen-url]')];
  const frame = slider.querySelector('iframe');
  const viewport = slider.querySelector('.project-screen-slider__viewport');
  let selected = 0;
  function resize() {
    const mobile = matchMedia('(max-width: 768px)').matches;
    const width = mobile ? Math.max(320, Math.min(430, viewport.clientWidth)) : Number(slider.dataset.desktopWidth);
    const scale = viewport.clientWidth / width;
    frame.style.width = `${width}px`;
    frame.style.height = `${Math.ceil(viewport.clientHeight / scale)}px`;
    frame.style.transform = `scale(${scale})`;
  }
  function select(index) {
    if (index < 0 || index >= buttons.length) return;
    const changed = index !== selected;
    selected = index;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
    frame.title = `${slider.dataset.projectName} ${buttons[selected].textContent} 실제 웹 화면`;
    if (changed) {
      frame.src = buttons[selected].dataset.screenUrl;
    }
  }
  frame.addEventListener('load', () => {
    resize();
  });
  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  // Arrow navigation applies to page controls, leaving the embedded site independent.
  slider.querySelector('.project-screen-slider__pages').addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const index = Math.max(0, Math.min(buttons.length - 1, selected + (event.key === 'ArrowRight' ? 1 : -1)));
    event.preventDefault();
    select(index);
    buttons[index].focus();
  });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
  addEventListener('resize', resize);
  select(0);
  resize();
});
