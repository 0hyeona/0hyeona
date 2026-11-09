import { $, arrow, element, reduceMotion, wrap } from './dom.js';

const items = [
  [
    "sangpag-1.jpg",
    "루노라 데일리 보습 로션",
    "가볍게 발리고 촉촉하게 마무리되는 데일리 로션의 사용감을 전달하는 상세페이지입니다. 제품 컷으로 분위기를 보여준 뒤, 제형과 피부에 바른 모습을 연결해 온라인에서도 발림성과 마무리감을 이해할 수 있도록 구성했습니다.",
    {
      brand: "루노라 · 스킨케어",
      direction: "크림과 베이지 계열의 색, 부드러운 자연광, 여유 있는 여백으로 편안한 데일리 케어 이미지를 표현했습니다. 제품 설명은 짧은 제목과 실제 사용 장면을 함께 배치해 읽는 부담을 줄였습니다.",
      flow: [
        ["제품의 첫인상", "제품 단독 컷과 데일리 보습 메시지로 로션의 차분한 분위기와 핵심 사용감을 먼저 소개합니다."],
        ["제형과 마무리감", "제형 클로즈업에서 바르는 장면과 흡수 후 피부로 이어지며, 발림성과 마무리감을 순서대로 보여줍니다."],
        ["하루의 사용 루틴", "아침과 밤의 사용 장면을 제안한 뒤 바르는 방법을 안내해, 일상에서 어떻게 사용할지 연결합니다."],
        ["성분과 제품 선택", "히알루론산·판테놀·세라마이드 소개로 정보를 보완하고, 제품 이미지와 선택 버튼으로 마무리합니다."],
      ],
    },
  ],
  [
    "sangpag-2.jpg",
    "클라우드 허그 바디필로우",
    "편안한 휴식 장면에서 시작해 바디필로우의 지지감과 촉감을 소개하는 상세페이지입니다. 실제로 안고 기대는 모습을 먼저 보여주고, 소재와 색상, 크기와 관리 정보로 이어지도록 구성했습니다.",
    {
      brand: "클라우드 허그 · 리빙",
      direction: "하늘색과 아이보리, 곡선 형태의 배경으로 부드럽고 포근한 인상을 표현했습니다. 사용 장면과 소재 확대 이미지를 번갈아 배치해 전체적인 사용 경험과 세부 질감을 함께 보여줍니다.",
      flow: [
        ["휴식 장면으로 시작", "침실에서 사용하는 메인 이미지와 간단한 특징 소개로 제품이 필요한 순간을 먼저 보여줍니다."],
        ["자세와 지지감 이해", "제품의 부위별 특징과 안고 기대는 장면을 연결해, 몸을 받쳐주는 형태와 사용 방식을 설명합니다."],
        ["소재와 색상 비교", "커버·충전재의 질감을 확대해서 보여준 뒤 아이보리, 하늘색, 회색을 나란한 흐름으로 소개합니다."],
        ["구매 전 정보 확인", "사이즈와 세탁·관리 정보를 정리하고 가격 및 제품 선택 영역으로 이어져, 마지막에 필요한 정보를 확인하도록 구성합니다."],
      ],
    },
  ],
  [
    "sangpag-4.jpg",
    "OA 스팀청소기",
    "바닥 청소를 가볍고 편리하게 이어가는 사용 경험을 소개하는 상세페이지입니다. 청소 준비부터 가구 아래 청소, 패드 사용과 보관까지의 순서에 맞춰 주요 기능을 나누어 보여줍니다.",
    {
      brand: "오아 · 생활가전",
      direction: "네이비와 밝은 블루 그레이를 대비해 기능별 구간을 구분했습니다. 제품 사용 사진, 기능을 강조하는 숫자, 간결한 아이콘을 조합해 긴 설명 없이도 핵심을 파악할 수 있도록 구성했습니다.",
      flow: [
        ["청소 목적과 제품 소개", "집 안에 놓인 제품 이미지와 청소 메시지를 함께 배치해 제품의 용도와 슬림한 형태를 먼저 전달합니다."],
        ["빠른 청소 준비", "예열 메시지를 별도 구간에서 강조해, 전원을 켜고 청소를 시작하는 과정을 설명합니다."],
        ["실제 청소 장면", "가구 아래에 들어가는 헤드와 극세사 패드를 차례로 보여주며, 이동성과 바닥에 닿는 부분의 특징을 소개합니다."],
        ["보관과 일상으로 연결", "스스로 세워 두는 보관 장면을 보여준 뒤 핵심 기능을 다시 정리하며 일상 속 사용 경험으로 마무리합니다."],
      ],
    },
  ],
];
const pad = number => String(number).padStart(2, "0");

function mountDetails(parent) {
  let active = 0;
  const root = element('article', 'detail-case-study'), tabs = element('div', 'case-tabs'), head = element('header', 'case-header'), heading = element('div'), eyebrow = element('p', 'case-eyebrow', 'DETAIL PAGE / DESIGN CASE'), title = element('h4'), meta = element('p', 'case-meta'), controls = element('div', 'case-controls');
  const prev = arrow('이전 상세페이지', '←'), next = arrow('다음 상세페이지', '→');
  controls.append(prev, next);
  heading.append(eyebrow, title, meta);
  head.append(heading, controls);
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', '상세페이지 프로젝트 선택');
  const buttons = items.map((item, i) => {
    const button = element('button', 'case-tab', item[1]);
    button.type = 'button';
    button.addEventListener('click', () => show(i));
    tabs.append(button);
    return button;
  });
  const layout = element('div', 'case-layout'), visual = element('figure', 'case-visual'), img = element('img'), imageNote = element('figcaption', '', 'FULL DESIGN — 전체 상세페이지'), notes = element('div', 'case-editorial');
  img.loading = 'lazy';
  img.decoding = 'async';
  visual.append(img, imageNote);
  layout.append(visual, notes);
  root.append(tabs, head, layout);
  parent.append(root);
  function show(value) {
    active = wrap(value, items.length);
    const [source, name, description, data = {}] = items[active];
    title.textContent = name;
    meta.textContent = (data.brand || '') + ' / 상세페이지 디자인';
    img.src = './img/' + source;
    img.alt = name + ' 전체 상세페이지';
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    notes.replaceChildren();
    const overview = element('section', 'case-note'), direction = element('section', 'case-note');
    overview.append(element('span', 'case-note-label', '01 / OVERVIEW'), element('h5', '', '프로젝트 소개'), element('p', '', description));
    direction.append(element('span', 'case-note-label', '02 / DESIGN DIRECTION'), element('h5', '', '디자인 방향'), element('p', '', data.direction || ''));
    notes.append(overview, direction);
    if (data.flow?.length) {
      const flow = element('section', 'case-note'), list = element('ol', 'case-flow');
      flow.append(element('span', 'case-note-label', '03 / CONTENT STRUCTURE'), element('h5', '', '콘텐츠 흐름'));
      data.flow.forEach(([label, copy], i) => {
        const li = element('li'), body = element('div');
        body.append(element('strong', '', label), element('p', '', copy));
        li.append(element('span', 'case-step', pad(i + 1)), body);
        list.append(li);
      });
      flow.append(list);
      notes.append(flow);
    }
  }
  prev.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  show(0);
}
mountDetails($('#detail-gallery'));
const detailCase = document.querySelector('.detail-case-study');
if (detailCase) {
  const dock = detailCase.querySelector('.case-controls');
  dock.classList.add('case-dock');
  document.body.append(dock);
  const buttons = dock.querySelectorAll('button');
  buttons.forEach((button, index) => {
    button.textContent = index ? '\u2192' : '\u2190';
    button.setAttribute('aria-label', index ? 'Next project' : 'Previous project');
    button.addEventListener('click', () => detailCase.querySelector('.case-header').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' }));
  });
  const label = document.createElement('span');
  label.className = 'case-dock-label';
  dock.insertBefore(label, buttons[1]);
  const updateDock = () => {
    const rect = detailCase.getBoundingClientRect();
    dock.hidden = rect.top > innerHeight * .65 || rect.bottom < 180;
    label.textContent = detailCase.querySelector('h4').textContent;
  };
  new MutationObserver(updateDock).observe(detailCase.querySelector('h4'), { childList: true, subtree: true, characterData: true });
  addEventListener('scroll', updateDock, { passive: true });
  addEventListener('resize', updateDock, { passive: true });
  updateDock();
}
// A separate sticky frame keeps the scaled notes' layout height accurate.
const caseNotes = document.querySelector('.case-editorial');
if (caseNotes) {
  const frame = element('div', 'case-editorial-frame');
  caseNotes.before(frame);
  frame.append(caseNotes);
  const sizeCaseNotes = () => {
    if (innerWidth <= 640) {
      frame.style.cssText = '';
      caseNotes.style.transform = '';
      return;
    }
    const nav = document.querySelector('.floating-nav');
    const safeTop = Math.max(80, (nav?.getBoundingClientRect().bottom || 64) + 24);
    const safeBottom = 104;
    const available = Math.max(160, innerHeight - safeTop - safeBottom);
    const naturalHeight = caseNotes.offsetHeight;
    const scale = Math.min(1, available / Math.max(1, naturalHeight));
    const height = naturalHeight * scale;
    frame.style.height = height + 'px';
    frame.style.top = (safeTop + (available - height) / 2) + 'px';
    caseNotes.style.transform = 'scale(' + scale + ')';
  };
  new ResizeObserver(sizeCaseNotes).observe(caseNotes);
  addEventListener('resize', sizeCaseNotes, { passive: true });
  document.fonts.ready.then(sizeCaseNotes);
  sizeCaseNotes();
}
