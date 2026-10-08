document.querySelectorAll('.project-showcase').forEach(project => {
  const buttons = [...project.querySelectorAll('[data-page-url]')];
  const frames = [...project.querySelectorAll('iframe')];
  function resize() {
    frames.forEach(frame => {
      const viewport = frame.parentElement;
      const mobile = frame.dataset.device === 'mobile' || matchMedia('(max-width: 768px)').matches;
      const desktopWidth = project.dataset.project === 'noda' ? 1920 : 1440;
      const width = frame.dataset.device === 'mobile' ? 390 : mobile ? Math.max(320, Math.min(430, document.documentElement.clientWidth)) : desktopWidth;
      const scale = viewport.clientWidth / width;
      if(!scale) return;
      frame.style.width = `${width}px`;
      frame.style.height = `${Math.round(viewport.clientHeight / scale)}px`;
      frame.style.transform = `scale(${scale})`;
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    frames.forEach(frame => { frame.src = button.dataset.pageUrl; });
    project.querySelector('.project-showcase__actions a[target="_blank"]').href = button.dataset.pageUrl;
  }));
  new ResizeObserver(resize).observe(project.querySelector('.project-showcase__preview'));
  window.addEventListener('resize', resize);
  resize();
});
