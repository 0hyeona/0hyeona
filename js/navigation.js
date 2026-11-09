import { $, $$ } from './dom.js';

const categoryOrder = ['uxui', 'banner', 'popup', 'poster', 'detail', 'notion'];
const categoryNames = { uxui: 'UX/UI 프로젝트', banner: '배너 디자인', popup: '팝업', poster: '포스터', detail: 'DETAIL PAGE DESIGN', notion: '공부 기록' };
// Keep category navigation within reach while browsing the work sections.
const workSwitcher = $('#work-switcher'), workChoices = $$('#work-switcher a');
workChoices.forEach(link => link.addEventListener('click', () => {
  workSwitcher.open = false;
  $(link.getAttribute('href')).focus({ preventScroll: true });
}));
document.addEventListener('click', event => {
  if (!workSwitcher.contains(event.target))
    workSwitcher.open = false;
});
workSwitcher.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    workSwitcher.open = false;
    $('#work-switcher summary').focus();
  }
});

function updateWorkSwitcher() {
  const work = $('#work').getBoundingClientRect(), show = work.top <= 100 && work.bottom > 120;
  if (!show && workSwitcher.contains(document.activeElement)) {
    workSwitcher.open = false;
    $('#floating-nav a[href="#work"]').focus({ preventScroll: true });
  }
  workSwitcher.hidden = !show;
  if (!show) {
    workSwitcher.open = false;
    return;
  }
  const current = [...categoryOrder].reverse().find(category => $('#' + category + '-showcase').getBoundingClientRect().top <= innerHeight * .35) || categoryOrder[0];
  $('#work-switcher-current').textContent = categoryNames[current];
  $('#work-switcher summary').setAttribute('aria-label', '작업 카테고리 선택, 현재 ' + categoryNames[current]);
  workChoices.forEach(link => {
    if (link.getAttribute('href') === '#' + current + '-showcase')
      link.setAttribute('aria-current', 'location');
    else
      link.removeAttribute('aria-current');
  });
}
// Existing query links continue to open the corresponding anchored gallery.
const requestedCategory = new URLSearchParams(location.search).get('work');
if (categoryOrder.includes(requestedCategory) && !location.hash)
  location.hash = requestedCategory + '-showcase';
const navLinks = $$('#floating-nav a'), navSections = navLinks.map(a => $(a.getAttribute('href')));
let scrollQueued = false;

function updateScroll() {
  const active = [...navSections].reverse().find(section => section.getBoundingClientRect().top <= innerHeight * .4) || navSections[0];
  navLinks.forEach(a => {
    if (a.getAttribute('href') === '#' + active.id)
      a.setAttribute('aria-current', 'location');
    else
      a.removeAttribute('aria-current');
  });
  updateWorkSwitcher();
  scrollQueued = false;
}
addEventListener('scroll', () => {
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateScroll);
  }
}, { passive: true });
addEventListener('resize', updateScroll, { passive: true });
updateScroll();
