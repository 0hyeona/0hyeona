import { element } from './dom.js';

const tools = [
  ['DESIGN', [['ps', 'Photoshop'], ['ai', 'Illustrator'], ['figma', 'Figma']]],
  ['WEB', [['html', 'HTML'], ['css', 'CSS'], ['js', 'JavaScript'], ['react', 'React']]],
  ['WORKFLOW', [['notion', 'Notion'], ['git', 'Git'], ['github', 'GitHub'], ['gpt', 'ChatGPT'], ['claude', 'Claude'], ['codex', 'Codex']]],
];
for (const [name, items] of tools) {
  const group = element('section', 'tool-group');
  group.append(element('h4', '', name));
  const list = element('ul', 'tool-list');
  for (const [file, label] of items) {
    const li = element('li', 'tool-item');
    const img = element('img');
    img.src = `./img/tool/${file}.svg`;
    img.alt = '';
    img.loading = 'lazy';
    if (['github', 'gpt', 'codex', 'react'].includes(file))
      img.classList.add('icon-white');
    if (file === 'notion')
      img.classList.add('icon-inverted');
    li.append(img, element('span', '', label));
    list.append(li);
  }
  group.append(list);
  document.querySelector('#tools-groups').append(group);
}
