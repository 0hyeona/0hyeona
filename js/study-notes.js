import { $, element } from './dom.js';

const notionNotes = [
  {
    "category": "tools",
    "title": "Photoshop",
    "description": "포토샵 기본 조작부터 이미지 보정과 마스크까지 모아둔 공부 기록",
    "id": "3b36d0879c1a8009996acbdda098328f"
  },
  {
    "category": "tools",
    "title": "Illustrator",
    "description": "펜툴, 패스파인더와 벡터 그래픽을 익히며 정리한 공부 기록",
    "id": "3b36d0879c1a8043b02fc38c0f6f8bce"
  },
  {
    "category": "tools",
    "title": "Figma",
    "description": "오토 레이아웃, 컴포넌트와 프로퍼티를 정리한 디자인 노트",
    "id": "3b56d0879c1a80ce9ca3c093fbb93d1b"
  },
  {
    "category": "publishing",
    "title": "HTML",
    "description": "문서 구조와 태그의 의미를 예제와 함께 정리한 학습 기록",
    "id": "3b26d0879c1a801caf0ee46332b9d3a5"
  },
  {
    "category": "publishing",
    "title": "CSS",
    "description": "선택자, 박스 모델과 레이아웃을 정리한 스타일링 노트",
    "id": "3b26d0879c1a80a1867ac5629b03e0dd"
  },
  {
    "category": "develop",
    "title": "JavaScript",
    "description": "변수와 데이터 타입부터 동적인 웹 기능까지 공부한 기록",
    "id": "3b26d0879c1a8007bb03e51ac7f9d56e"
  },
  {
    "category": "develop",
    "title": "React",
    "description": "JSX, 컴포넌트와 프로젝트 구조를 정리한 개발 노트",
    "id": "3f16d0879c1a80e38db1c34243f95526"
  },
  {
    "category": "develop",
    "title": "Git & GitHub",
    "description": "학원에서 배운 Git과 GitHub 사용법을 정리한 학습 기록",
    "id": "3b36d0879c1a80f2bb09efe5fa14e94d"
  },
  {
    "category": "develop",
    "title": "Next.js 기초와 프로젝트 생성",
    "description": "React와 Next.js를 비교하고 App Router 구조를 정리한 기록",
    "id": "3ca6d0879c1a80c19ec4f20cb05233f8"
  }
];

function mountNotionArchive() {
  const root = $('#notion-archive');
  if (!root)
    return;
  const labels = { tools: '디자인 툴', publishing: '퍼블리싱', develop: '개발' };
  const folderIcon = '<svg viewBox="0 0 120 92" fill="none" aria-hidden="true"><path d="M7 17a7 7 0 0 1 7-7h29l11 11h52a7 7 0 0 1 7 7v49a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8Z" fill="#72b5d8"/><path d="M7 35a7 7 0 0 1 7-7h92a7 7 0 0 1 7 7v42a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8Z" fill="#a4d6ef"/><path d="M15 29h90" stroke="#d9f1fc" stroke-width="2"/></svg>';
  const bar = element('div', 'finder-toolbar'), dots = element('div', 'finder-dots');
  dots.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i++)
    dots.append(element('span'));
  const back = element('button', 'finder-back', '←');
  back.type = 'button';
  back.setAttribute('aria-label', '상위 폴더로 이동');
  const title = element('span', 'finder-title', 'Study Notes');
  bar.append(dots, back, title);
  const body = element('div', 'finder-body'), sidebar = element('div', 'finder-sidebar');
  sidebar.setAttribute('role', 'group');
  sidebar.setAttribute('aria-label', '학습 폴더');
  sidebar.append(element('p', 'finder-sidebar-label', 'FAVORITES'));
  const grid = element('div', 'finder-grid'), status = element('div', 'finder-status');
  status.setAttribute('aria-live', 'polite');
  const buttons = [];
  function show(category, focus = false) {
    title.textContent = category ? 'Study Notes / ' + labels[category] : 'Study Notes';
    back.disabled = !category;
    buttons.forEach(([key, button]) => button.setAttribute('aria-pressed', String(key === category)));
    grid.replaceChildren();
    if (!category) {
      Object.entries(labels).forEach(([key, label]) => {
        const button = element('button', 'finder-folder');
        button.type = 'button';
        const icon = element('span', 'finder-folder-icon');
        icon.innerHTML = folderIcon;
        button.append(icon, element('strong', '', label), element('span', 'finder-meta', notionNotes.filter(note => note.category === key).length + ' notes'));
        button.addEventListener('click', () => show(key, true));
        grid.append(button);
      });
      status.textContent = '3 folders · 폴더를 클릭해 학습 기록을 열어보세요';
    }
    else {
      const notes = notionNotes.filter(note => note.category === category);
      notes.forEach(note => {
        const link = element('a', 'finder-note');
        link.href = 'https://www.notion.so/' + note.id.replaceAll('-', '');
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', note.title + ' — Notion 새 탭에서 열기');
        const toolIcons = { Photoshop: 'ps', Illustrator: 'ai', Figma: 'figma', HTML: 'html', CSS: 'css', JavaScript: 'js', React: 'react', 'Git & GitHub': 'github' };
        const toolIcon = note.title.startsWith('Next.js') ? 'nextjs' : toolIcons[note.title] || 'notion';
        const icon = element('img', 'finder-document');
        icon.src = './img/tool/' + toolIcon + '.svg';
        icon.alt = '';
        icon.loading = 'lazy';
        link.append(icon, element('strong', '', note.title));
        link.title = note.description;
        grid.append(link);
      });
      status.textContent = notes.length + ' notes · 선택한 기록은 Notion에서 열립니다';
    }
    if (focus)
      grid.querySelector('button,a')?.focus({ preventScroll: true });
  }
  [['', '전체 폴더'], ...Object.entries(labels)].forEach(([key, label]) => {
    const button = element('button', 'finder-nav', label);
    button.type = 'button';
    button.addEventListener('click', () => show(key));
    sidebar.append(button);
    buttons.push([key, button]);
  });
  back.addEventListener('click', () => show('', true));
  body.append(sidebar, grid);
  root.replaceChildren(bar, body, status);
  show('');
}
mountNotionArchive();
