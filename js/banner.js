import { $, arrow, captionNodes, element, wrap } from './dom.js';

const items = [
  ["banner-6.jpg","NOVERA","모노톤과 세리프 타이포그래피로 클래식한 가을 컬렉션을 표현한 배너입니다. 양쪽에 배치한 모델과 중앙의 큰 타이틀로 균형을 잡고, 얇은 그리드로 정돈된 인상을 더했습니다."],
  ["banner-1.jpg","닥터마틴","인물과 대형 타이포그래피를 겹쳐 자유로운 스트리트 무드를 표현한 배너입니다. 흑백 중심의 화면에 신발의 노란 스티치와 연결되는 버튼을 배치해, 제품에서 행동 유도 요소까지 시선이 이어지도록 구성했습니다."],
  ["banner-3.jpg","쏘카","차량 이미지와 핵심 메시지를 좌우로 나누어 첫 대여 혜택을 전달한 배너입니다. 검정 배경과 흰색 차량의 대비로 주목도를 높이고, 할인 문구와 예약 버튼에 브랜드 블루를 적용해 주요 정보를 강조했습니다."],
  ["banner-4.jpg","카드 혜택","어두운 배경에 다채로운 카드를 겹쳐 배치해 일상 속 다양한 혜택을 표현한 배너입니다. 역동적인 카드 구성과 굵은 헤드라인을 대비시켜 캐시백 메시지가 먼저 읽히도록 구성했습니다."],
];
const gallery = $("#banner-gallery");

function mountBanner(parent) {
  let index = 0;
  const root = element('div', 'showcase'), stage = element('div', 'showcase-stage is-banner');
  const prev = arrow('이전 작품', '←'), next = arrow('다음 작품', '→'), open = element('div', 'showcase-image'), img = element('img');
  open.append(img);
  stage.append(prev, open, next);
  root.append(stage);
  const caption = captionNodes(root);
  parent.append(root);
  function alignBanner() {
    if (!img.naturalWidth || !img.naturalHeight)
      return;
    const box = open.getBoundingClientRect(), rootBox = root.getBoundingClientRect();
    const artWidth = Math.min(box.width, box.height * img.naturalWidth / img.naturalHeight);
    const left = box.left + (box.width - artWidth) / 2, right = left + artWidth;
    const copy = caption.title.parentElement;
    if (innerWidth <= 784) {
      copy.style.marginLeft = '';
      copy.style.marginRight = '';
      return;
    }
    copy.style.marginLeft = Math.max(0, left - rootBox.left) + 'px';
    copy.style.marginRight = Math.max(0, rootBox.right - right) + 'px';
  }
  img.addEventListener('load', alignBanner);
  new ResizeObserver(alignBanner).observe(open);
  addEventListener('resize', alignBanner, { passive: true });
  function show(value) {
    index = wrap(value, items.length);
    const [source, title, description] = items[index];
    stage.classList.toggle('is-martens', source === 'banner-1.jpg');
    img.src = './img/' + source;
    img.alt = title;
    caption.title.textContent = title;
    caption.description.textContent = description;
  }
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + 1);
    }
  });
  show(index);
}
mountBanner(gallery);
