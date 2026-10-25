// The saved homepage HTML shares this site's origin, so its document can scroll inside the PC preview.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('[data-project-preview]').forEach((viewport) => {
  const visual = viewport.closest('.project-overview__visual');
  const frame = viewport.querySelector('iframe');
  const pageButtons = [...visual.querySelectorAll('[data-preview-src]')];
  const projectName = visual.closest('.project-page')?.querySelector('#project-title')?.textContent.trim() || '프로젝트';
  let ready = false;
  let visible = false;
  let hovering = false;
  let last = 0;
  let hold = 0;
  let position = 0;
  let animation = null;

  function size() {
    const scale = viewport.clientWidth / 1440;
    frame.style.transform = `scale(${scale})`;
    frame.style.height = `${Math.ceil(viewport.clientHeight / scale)}px`;
  }

  function stop() {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
    last = 0;
  }

  function start() {
    if (animation === null && ready && visible && !hovering && !document.hidden && !reduceMotion.matches) {
      animation = requestAnimationFrame(tick);
    }
  }

  function tick(time) {
    animation = null;
    if (!ready || !visible || hovering || document.hidden || reduceMotion.matches) {
      last = 0;
      return;
    }
    const elapsed = last ? Math.min(time - last, 60) : 0;
    last = time;
    try {
      const documentHeight = frame.contentDocument.scrollingElement.scrollHeight;
      const end = Math.min(Math.max(0, documentHeight - frame.clientHeight), 2200);
      if (position < end - 1) {
        position = Math.min(end, position + elapsed * .038);
        frame.contentWindow.scrollTo(0, position);
        hold = 0;
      } else if (!hold) {
        hold = time;
      } else if (time - hold > 2200) {
        position = 0;
        frame.contentWindow.scrollTo(0, 0);
        hold = 0;
      }
    } catch {
      ready = false;
      return;
    }
    animation = requestAnimationFrame(tick);
  }

  new ResizeObserver(size).observe(viewport);
  size();
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }, { threshold: .15 }).observe(viewport);
  frame.addEventListener('load', () => {
    size();
    try { ready = Boolean(frame.contentDocument?.scrollingElement); } catch { ready = false; }
    position = 0;
    hold = 0;
    start();
  });
  pageButtons.forEach((button) => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    pageButtons.forEach((page) => page.setAttribute('aria-pressed', String(page === button)));
    stop();
    ready = false;
    position = 0;
    hold = 0;
    frame.title = `${projectName} ${button.textContent.trim()} PC 페이지 미리보기`;
    frame.src = button.dataset.previewSrc;
  }));
  visual.addEventListener('mouseenter', () => { hovering = true; stop(); });
  visual.addEventListener('mouseleave', () => { hovering = false; start(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) stop(); else start(); });
});
