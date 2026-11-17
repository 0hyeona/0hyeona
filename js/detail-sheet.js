import { element } from './dom.js';

export function createDetailSheet(root) {
  const mobile = matchMedia('(max-width: 784px)');
  const trigger = element('button', 'detail-sheet-trigger', '디자인 설명');
  trigger.type = 'button';
  trigger.hidden = true;
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'detail-description-sheet');
  const dialog = element('dialog', 'detail-sheet');
  dialog.id = 'detail-description-sheet';
  dialog.setAttribute('aria-labelledby', 'detail-sheet-title');
  const header = element('header', 'detail-sheet-header');
  const title = element('h3');
  title.id = 'detail-sheet-title';
  const close = element('button', 'detail-sheet-close', '닫기');
  close.type = 'button';
  close.autofocus = true;
  header.append(title, close);
  const body = element('div', 'detail-sheet-body');
  const navigation = element('div', 'detail-sheet-navigation');
  const previous = element('button', '', '←');
  const next = element('button', '', '→');
  previous.type = next.type = 'button';
  previous.setAttribute('aria-label', '이전 상세페이지');
  next.setAttribute('aria-label', '다음 상세페이지');
  navigation.append(previous, next);
  dialog.append(header, body, navigation);
  document.body.append(trigger, dialog);
  let savedY = 0;
  let savedStyle;
  let navigate = () => {};
  previous.addEventListener('click', () => navigate(-1));
  next.addEventListener('click', () => navigate(1));

  function visibility() {
    const rect = root.getBoundingClientRect();
    trigger.hidden = !mobile.matches || dialog.open || rect.top > innerHeight * .7 || rect.bottom < 140;
  }

  trigger.addEventListener('click', () => {
    if (!mobile.matches || dialog.open) return;
    savedY = window.scrollY;
    savedStyle = document.body.getAttribute('style');
    Object.assign(document.body.style, { position: 'fixed', top: `-${savedY}px`, width: '100%', overflow: 'hidden' });
    dialog.showModal();
    dialog.scrollTop = 0;
    visibility();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientY < rect.top || event.clientY > rect.bottom ||
        event.clientX < rect.left || event.clientX > rect.right)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (savedStyle === null) document.body.removeAttribute('style');
    else document.body.setAttribute('style', savedStyle);
    window.scrollTo({ top: savedY, behavior: 'instant' });
    visibility();
    if (!trigger.hidden) trigger.focus({ preventScroll: true });
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches && dialog.open) dialog.close();
    visibility();
  });
  window.addEventListener('scroll', visibility, { passive: true });
  window.addEventListener('resize', visibility, { passive: true });
  new ResizeObserver(visibility).observe(root);

  function accordion(label, content) {
    const details = element('details', 'detail-sheet-section');
    details.append(element('summary', '', label), content);
    return details;
  }

  return {
    setNavigate(callback) { navigate = callback; },
    update(name, description, data) {
      title.textContent = name;
      body.replaceChildren();
      const intro = element('section', 'detail-sheet-intro');
      const shortDescription = description.match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || description;
      intro.append(element('h4', '', '프로젝트 소개'), element('p', '', shortDescription));
      body.append(intro, accordion('디자인 방향', element('p', '', data.direction || '')));
      if (data.flow?.length) {
        const list = element('ol', 'detail-sheet-flow');
        data.flow.forEach(([label, copy]) => {
          const item = element('li');
          item.append(element('h4', '', label), element('p', '', copy));
          list.append(item);
        });
        body.append(accordion('콘텐츠 흐름', list));
      }
      if (dialog.open) dialog.scrollTop = 0;
      visibility();
    }
  };
}
