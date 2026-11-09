export const $ = selector => document.querySelector(selector);
export const $$ = selector => [...document.querySelectorAll(selector)];
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const wrap = (index, length) => ((index % length) + length) % length;

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function arrow(label, text) {
  const button = element('button', 'round-button', text);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}

export function captionNodes(parent) {
  const caption = element('div', 'showcase-caption');
  caption.setAttribute('aria-live', 'polite');
  const title = element('h4');
  const description = element('p');
  caption.append(title, description);
  parent.append(caption);
  return { title, description };
}
