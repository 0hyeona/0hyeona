import { $, $$ } from './dom.js';

const categoryOrder = ['uxui', 'banner', 'popup', 'poster', 'detail', 'notion'];
const categoryNames = { uxui: 'UX/UI Projects', banner: 'Banners', popup: 'Popups', poster: 'Posters', detail: 'Detail Pages', notion: 'Study Notes' };
// Keep category navigation within reach while browsing the work sections.
const workSwitcher = $('#work-switcher'), workChoices = $$('#work-switcher a[href$="-showcase"]');
$$('#work-switcher a').forEach(link => link.addEventListener('click', () => {
  workSwitcher.open = false;
  const target = $(link.getAttribute('href'));
  if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
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
  const work = $('#work').getBoundingClientRect(), inWork = work.top <= 100 && work.bottom > 120, show = true;
  if (!show && workSwitcher.contains(document.activeElement)) {
    workSwitcher.open = false;
    $('#work-switcher summary').focus({ preventScroll: true });
  }
  workSwitcher.hidden = false;
  if (!show) {
    workSwitcher.open = false;
    return;
  }
  const current = [...categoryOrder].reverse().find(category => $('#' + category + '-showcase').getBoundingClientRect().top <= innerHeight * .35) || categoryOrder[0];
  $('#work-switcher-current').textContent = categoryNames[current];
  $('#work-switcher summary').setAttribute('aria-label', '작업 카테고리 선택, 현재 ' + categoryNames[current]);
  workChoices.forEach(link => {
    if (inWork && link.getAttribute('href') === '#' + current + '-showcase')
      link.setAttribute('aria-current', 'location');
    else
      link.removeAttribute('aria-current');
  });
}
const categoryToggle = $('#work-switcher .work-submenu-heading button');
categoryToggle.addEventListener('click', () => {
  const expanded = categoryToggle.getAttribute('aria-expanded') !== 'true';
  categoryToggle.setAttribute('aria-expanded', String(expanded));
  $('#work-category-links').hidden = !expanded;
});
// Existing query links continue to open the corresponding anchored gallery.
const requestedCategory = new URLSearchParams(location.search).get('work');
if (categoryOrder.includes(requestedCategory) && !location.hash)
  location.hash = requestedCategory + '-showcase';
const navLinks = $$('#work-switcher nav > a, #work-switcher .work-submenu-heading > a'), navSections = navLinks.map(a => $(a.getAttribute('href')));
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
