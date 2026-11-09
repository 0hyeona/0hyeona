import { $, arrow, captionNodes, element, reduceMotion, wrap } from './dom.js';

export function mountArtworkGallery(category, label, items) {
  const gallery = $(`#${category}-gallery`);
  const root = element('div', `poster-feature is-${category}`);
  const art = element('div', 'poster-art');
  const image = element('img');
  const placeholder = element('span', 'artwork-placeholder', '작업 준비 중');
  image.width = 500;
  image.height = 750;
  image.decoding = 'async';
  image.draggable = false;
  art.append(image, placeholder);

  const info = element('div', 'poster-info');
  const caption = captionNodes(info);
  const controls = element('div', 'poster-visual');
  const previous = arrow(`이전 ${label}`, '←');
  const next = arrow(`다음 ${label}`, '→');
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', `${label} 넘기기`);
  controls.append(previous, art, next);
  root.append(controls, info);
  gallery.append(root);

  let index = 0;
  let artAnimation;
  let captionAnimation;

  function show() {
    const [source, title, description] = items[index];
    image.hidden = !source;
    image.alt = source ? title : '';
    placeholder.hidden = Boolean(source);
    art.classList.toggle('is-empty', !source);
    if (source) image.src = `./img/${source}`;
    else image.removeAttribute('src');
    caption.title.textContent = title;
    caption.description.textContent = description;
  }

  function step(delta) {
    artAnimation?.cancel();
    captionAnimation?.cancel();
    index = wrap(index + delta, items.length);
    show();
    if (reduceMotion.matches) return;
    const timing = { duration: 300, easing: 'ease-out' };
    artAnimation = art.animate([
      { opacity: .25, transform: `translateX(${delta * 10}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ], timing);
    captionAnimation = caption.title.parentElement.animate([
      { opacity: .3, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], timing);
  }

  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  root.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });
  show();
}
