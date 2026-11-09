import { mountArtworkGallery } from './artwork-gallery.js';

const items = [
  ["poster-1.jpg","FLORA","아이보리와 차분한 올리브 컬러로 향수의 고요한 분위기를 표현한 포스터입니다. 기울어진 제품을 반복 배치해 리듬을 만들고, 넓은 여백과 세리프 서체로 투명한 유리 소재와 섬세한 인상을 강조했습니다."],
  ["poster-2.jpg","AirPods Max","무채색 배경과 빛의 대비로 헤드폰의 형태와 소재감을 강조한 포스터입니다. 제품과 타이포그래피를 겹쳐 공간감을 만들고, 하단 그림자로 공중에 떠 있는 듯한 인상을 표현했습니다."],
  ["poster-3.jpg","IKEA","검정 배경 위에 선명한 블루 체어를 배치해 제품의 형태와 색을 강조한 포스터입니다. 명도를 달리한 반복 타이포그래피로 깊이를 더하고, 하단의 짧은 카피와 로고로 시각적 흐름을 정리했습니다."],
  ["tamburins-chamo.png","TAMBURINS CHAMO","거친 종이와 석재 질감을 겹쳐 제품의 조형적인 실루엣을 강조한 포스터입니다. 따뜻한 중성 톤과 여백으로 CHAMO의 차분한 분위기를 표현했습니다."],
];
mountArtworkGallery('poster', '포스터', items);
