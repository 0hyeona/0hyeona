import { collections } from './portfolio-data.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const pad = n => String(n).padStart(2,'0');
const wrap = (n,length) => ((n % length) + length) % length;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const preview = source => (source.startsWith('previews/')||source==='poster/tamburins-chamo.png')?'./img/'+source:`./img/previews/${source.split('/').pop()}`;
const element = (tag, className, text) => { const el=document.createElement(tag); if(className)el.className=className;if(text!==undefined)el.textContent=text;return el; };

// Use actual existing tool icons, with visible names and no invented skill levels.
const tools = [
 ['DESIGN',[['ps','Photoshop'],['ai','Illustrator'],['figma','Figma']]],
 ['WEB',[['html','HTML'],['css','CSS'],['js','JavaScript'],['react','React']]],
 ['WORKFLOW',[['notion','Notion'],['git','Git'],['github','GitHub'],['gpt','ChatGPT'],['claude','Claude'],['codex','Codex']]],
];
for(const [name,items] of tools){const group=element('section','tool-group');group.append(element('h4','',name));const list=element('ul','tool-list');for(const [file,label] of items){const li=element('li','tool-item');const img=element('img');img.src=`./img/tool/${file}.svg`;img.alt='';img.loading='lazy';if(['github','gpt','codex','react'].includes(file))img.classList.add('icon-white');if(file==='notion')img.classList.add('icon-inverted');li.append(img,element('span','',label));list.append(li);}group.append(list);$('#tools-groups').append(group);}

// Side cards rotate to the center; the centered card opens its anchored section.
const categoryOrder=['uxui','banner','popup','poster','detail','develop','notion'];
const selectWork={};
const categoryNames={uxui:'UX/UI 퍼블리싱',banner:'배너 디자인',popup:'팝업',poster:'포스터',detail:'DETAIL PAGE DESIGN',develop:'개발',notion:'공부 기록'};
const categoryLabels={uxui:['UX/UI','PUBLISHING'],banner:['BANNER','DESIGN'],popup:['POP-UP','DESIGN'],poster:['POSTER','DESIGN'],detail:['DETAIL','PAGE'],develop:['DEVELOP'],notion:['NOTION','STUDY']};
function arrow(label,text){const button=element('button','round-button',text);button.type='button';button.setAttribute('aria-label',label);return button;}
function captionNodes(parent){const caption=element('div','showcase-caption');caption.setAttribute('aria-live','polite');const title=element('h4'),description=element('p');caption.append(title,description);parent.append(caption);return {title,description};}
const symbolsForArchive={develop:'<svg viewBox="0 0 88 88" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="10" y="17" width="68" height="54" rx="2"/><path d="M10 29h68M23 44l-9 8 9 8m42-16 9 8-9 8m-16-20-10 24"/></svg>',notion:'<svg viewBox="0 0 88 88" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M13 19c11-3 22-2 31 3v48c-9-5-20-6-31-3V19Zm62 0c-11-3-22-2-31 3v48c9-5 20-6 31-3V19Z"/><path d="M21 33c5-1 10 0 15 2M21 43c5-1 10 0 15 2m16-10c5-2 10-3 15-2m-15 12c5-2 10-3 15-2"/></svg>'};
function mountArchiveMenu(){
 const root=$('#archive-cards');let index=0;
 const cards=categoryOrder.map((category,i)=>{
  const link=element('a','archive-card');link.href='#'+category+'-showcase';link.dataset.category=category;
  link.setAttribute('aria-label',categoryNames[category]+' 작업 섹션으로 이동');
  const media=element('div','archive-card-media'+(category==='banner'?' archive-banner-collage':''));
  const available=(collections[category]?.items||[]).filter(([source])=>source);
  const sources=category==='banner'?available.slice(0,3):available.slice(0,1);
  sources.forEach(([source])=>{const img=element('img');img.src=preview(source);img.alt='';img.draggable=false;media.append(img);});
  if(category==='uxui'){media.classList.add('archive-project-image');const img=element('img');img.src='./img/rom&nd.png';img.alt='';img.loading='lazy';media.append(img);}
  if(category==='develop'||category==='notion'){media.classList.add('archive-symbol');media.innerHTML=symbolsForArchive[category];}
  const overlay=element('span','archive-card-overlay'),title=element('strong');categoryLabels[category].forEach(line=>title.append(element('span','',line)));overlay.append(element('span','archive-card-number',pad(i+1)),title);
  link.append(media,overlay,element('span','archive-card-caption',categoryNames[category]));
  link.addEventListener('click',event=>{
   if(i!==index){event.preventDefault();index=i;draw();return;}
   document.getElementById(category+'-showcase').focus({preventScroll:true});
  });
  root.append(link);return link;
 });
 function draw(){cards.forEach((card,i)=>{const raw=wrap(i-index,cards.length),offset=raw>Math.floor(cards.length/2)?raw-cards.length:raw;card.dataset.slot=offset;card.classList.toggle('is-current',offset===0);card.setAttribute('aria-label',categoryNames[categoryOrder[i]]+(offset===0?' 작업으로 이동':' 가운데로 이동'));});}
 $('.archive-prev').addEventListener('click',()=>{index=wrap(index-1,cards.length);draw();});
 $('.archive-next').addEventListener('click',()=>{index=wrap(index+1,cards.length);draw();});
 draw();
}
function mountSlideshow(category,parent){
 const {items}=collections[category];let index=0;const root=element('div','showcase'),stage=element('div','showcase-stage is-'+category);
 const prev=arrow('이전 작품','←'),next=arrow('다음 작품','→'),open=element('div','showcase-image'),img=element('img');open.append(img);stage.append(prev,open,next);root.append(stage);const caption=captionNodes(root);parent.append(root);
 function alignBanner(){
  if(category!=='banner'||!img.naturalWidth||!img.naturalHeight)return;
  const box=open.getBoundingClientRect(),rootBox=root.getBoundingClientRect();
  const artWidth=Math.min(box.width,box.height*img.naturalWidth/img.naturalHeight);
  const left=box.left+(box.width-artWidth)/2,right=left+artWidth;
  const copy=caption.title.parentElement;
  if(innerWidth<=784){copy.style.marginLeft='';copy.style.marginRight='';return;}
  copy.style.marginLeft=Math.max(0,left-rootBox.left)+'px';
  copy.style.marginRight=Math.max(0,rootBox.right-right)+'px';
 }
 if(category==='banner'){img.addEventListener('load',alignBanner);new ResizeObserver(alignBanner).observe(open);addEventListener('resize',alignBanner,{passive:true});}
 function show(value){index=wrap(value,items.length);const [source,title,description]=items[index];stage.classList.toggle('is-martens',source==='banner/banner-1.jpg');img.src='./img/'+source;img.alt=title;caption.title.textContent=title;caption.description.textContent=description;}
 prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}});show(index);selectWork[category]=show;
}
function mountFeature(category,parent){
 const {items}=collections[category];let index=0,artAnimation=null,copyAnimation=null;
 const root=element('div','poster-feature is-'+category),art=element('div','poster-art'),img=element('img'),info=element('div','poster-info'),empty=element('span','artwork-placeholder','작업 준비 중');
 img.width=500;img.height=750;img.decoding='async';img.draggable=false;art.append(img,empty);
 const caption=captionNodes(info),controls=element('div','poster-visual'),prev=arrow('이전 '+categoryNames[category],'←'),next=arrow('다음 '+categoryNames[category],'→');controls.setAttribute('role','group');controls.setAttribute('aria-label',categoryNames[category]+' 넘기기');controls.append(prev,art,next);root.append(controls,info);parent.append(root);
 function show(value){index=wrap(value,items.length);const [source,title,description]=items[index];img.hidden=!source;empty.hidden=Boolean(source);art.classList.toggle('is-empty',!source);if(source)img.src=preview(source);else img.removeAttribute('src');img.alt=source?title:'';caption.title.textContent=title;caption.description.textContent=description;}
 function step(delta){artAnimation?.cancel();copyAnimation?.cancel();show(index+delta);if(!reduceMotion.matches){artAnimation=art.animate([{opacity:.25,transform:'translateX('+delta*10+'px)'},{opacity:1,transform:'translateX(0)'}],{duration:300,easing:'ease-out'});copyAnimation=caption.title.parentElement.animate([{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});}}
 prev.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});show(index);selectWork[category]=show;
}
function mountDetails(parent){
 const available=collections.detail.items.map((item,index)=>({item,index})).filter(({item})=>item[0]);let active=0;
 const root=element('article','detail-case-study'),tabs=element('div','case-tabs'),head=element('header','case-header'),heading=element('div'),eyebrow=element('p','case-eyebrow','DETAIL PAGE / DESIGN CASE'),title=element('h4'),meta=element('p','case-meta'),controls=element('div','case-controls');
 const prev=arrow('이전 상세페이지','←'),next=arrow('다음 상세페이지','→');controls.append(prev,next);heading.append(eyebrow,title,meta);head.append(heading,controls);
 tabs.setAttribute('role','group');tabs.setAttribute('aria-label','상세페이지 프로젝트 선택');
 const buttons=available.map(({item},i)=>{const button=element('button','case-tab',item[1]);button.type='button';button.addEventListener('click',()=>show(i));tabs.append(button);return button;});
 const layout=element('div','case-layout'),visual=element('figure','case-visual'),img=element('img'),imageNote=element('figcaption','','FULL DESIGN — 전체 상세페이지'),notes=element('div','case-editorial');
 img.loading='lazy';img.decoding='async';visual.append(img,imageNote);layout.append(visual,notes);root.append(tabs,head,layout);parent.append(root);
 function show(value){active=wrap(value,available.length);const [source,name,description,data={}]=available[active].item;title.textContent=name;meta.textContent=(data.brand||'')+' / 상세페이지 디자인';img.src='./img/'+source;img.alt=name+' 전체 상세페이지';buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));notes.replaceChildren();
  const overview=element('section','case-note'),direction=element('section','case-note');overview.append(element('span','case-note-label','01 / OVERVIEW'),element('h5','','프로젝트 소개'),element('p','',description));direction.append(element('span','case-note-label','02 / DESIGN DIRECTION'),element('h5','','디자인 방향'),element('p','',data.direction||''));notes.append(overview,direction);
  if(data.flow?.length){const flow=element('section','case-note'),list=element('ol','case-flow');flow.append(element('span','case-note-label','03 / CONTENT STRUCTURE'),element('h5','','콘텐츠 흐름'));data.flow.forEach(([label,copy],i)=>{const li=element('li'),body=element('div');body.append(element('strong','',label),element('p','',copy));li.append(element('span','case-step',pad(i+1)),body);list.append(li);});flow.append(list);notes.append(flow);}
 }
 prev.addEventListener('click',()=>show(active-1));next.addEventListener('click',()=>show(active+1));
 show(0);selectWork.detail=value=>{const target=available.findIndex(({index})=>index===value);if(target>=0)show(target);};
}
mountArchiveMenu();mountSlideshow('banner',$('#banner-gallery'));mountFeature('popup',$('#popup-gallery'));mountFeature('poster',$('#poster-gallery'));mountDetails($('#detail-gallery'));

// A curated snapshot of study pages read through Notion MCP. The public site never stores Notion credentials.
const notionNotes=[
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
function mountNotionArchive(){
 const root=$('#notion-archive');if(!root)return;
 const labels={tools:'디자인 툴',publishing:'퍼블리싱',develop:'개발'};
 const folderIcon='<svg viewBox="0 0 120 92" fill="none" aria-hidden="true"><path d="M7 17a7 7 0 0 1 7-7h29l11 11h52a7 7 0 0 1 7 7v49a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8Z" fill="#72b5d8"/><path d="M7 35a7 7 0 0 1 7-7h92a7 7 0 0 1 7 7v42a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8Z" fill="#a4d6ef"/><path d="M15 29h90" stroke="#d9f1fc" stroke-width="2"/></svg>';
 const bar=element('div','finder-toolbar'),dots=element('div','finder-dots');dots.setAttribute('aria-hidden','true');
 for(let i=0;i<3;i++)dots.append(element('span'));
 const back=element('button','finder-back','←');back.type='button';back.setAttribute('aria-label','상위 폴더로 이동');
 const title=element('span','finder-title','Study Notes');bar.append(dots,back,title);
 const body=element('div','finder-body'),sidebar=element('div','finder-sidebar');sidebar.setAttribute('role','group');sidebar.setAttribute('aria-label','학습 폴더');
 sidebar.append(element('p','finder-sidebar-label','FAVORITES'));
 const grid=element('div','finder-grid'),status=element('div','finder-status');status.setAttribute('aria-live','polite');
 const buttons=[];
 function show(category,focus=false){
  title.textContent=category?'Study Notes / '+labels[category]:'Study Notes';back.disabled=!category;
  buttons.forEach(([key,button])=>button.setAttribute('aria-pressed',String(key===category)));
  grid.replaceChildren();
  if(!category){
   Object.entries(labels).forEach(([key,label])=>{const button=element('button','finder-folder');button.type='button';
    const icon=element('span','finder-folder-icon');icon.innerHTML=folderIcon;
    button.append(icon,element('strong','',label),element('span','finder-meta',notionNotes.filter(note=>note.category===key).length+' notes'));
    button.addEventListener('click',()=>show(key,true));grid.append(button);
   });
   status.textContent='3 folders · 폴더를 클릭해 학습 기록을 열어보세요';
  }else{
   const notes=notionNotes.filter(note=>note.category===category);
   notes.forEach(note=>{const link=element('a','finder-note');link.href='https://www.notion.so/'+note.id.replaceAll('-','');link.target='_blank';link.rel='noopener noreferrer';
    link.setAttribute('aria-label',note.title+' — Notion 새 탭에서 열기');
    const toolIcons={Photoshop:'ps',Illustrator:'ai',Figma:'figma',HTML:'html',CSS:'css',JavaScript:'js',React:'react','Git & GitHub':'github'};
    const toolIcon=note.title.startsWith('Next.js')?'nextjs':toolIcons[note.title]||'notion';
    const icon=element('img','finder-document');icon.src='./img/tool/'+toolIcon+'.svg';icon.alt='';icon.loading='lazy';
    link.append(icon,element('strong','',note.title));link.title=note.description;grid.append(link);
   });
   status.textContent=notes.length+' notes · 선택한 기록은 Notion에서 열립니다';
  }
  if(focus)grid.querySelector('button,a')?.focus({preventScroll:true});
 }
 [['','전체 폴더'],...Object.entries(labels)].forEach(([key,label])=>{const button=element('button','finder-nav',label);button.type='button';button.addEventListener('click',()=>show(key));sidebar.append(button);buttons.push([key,button]);});
 back.addEventListener('click',()=>show('',true));body.append(sidebar,grid);root.replaceChildren(bar,body,status);show('');
}
mountNotionArchive();

// Keep category navigation within reach while browsing the work sections.
const workSwitcher=$('#work-switcher'),workChoices=$$('#work-switcher a');
workChoices.forEach(link=>link.addEventListener('click',()=>{workSwitcher.open=false;$(link.getAttribute('href')).focus({preventScroll:true});}));
document.addEventListener('click',event=>{if(!workSwitcher.contains(event.target))workSwitcher.open=false;});
workSwitcher.addEventListener('keydown',event=>{if(event.key==='Escape'){workSwitcher.open=false;$('#work-switcher summary').focus();}});
function updateWorkSwitcher(){
 const work=$('#work').getBoundingClientRect(),show=work.top<=100&&work.bottom>120;
 if(!show&&workSwitcher.contains(document.activeElement)){workSwitcher.open=false;$('#floating-nav a[href="#work"]').focus({preventScroll:true});}
 workSwitcher.hidden=!show;if(!show){workSwitcher.open=false;return;}
 const current=[...categoryOrder].reverse().find(category=>$('#'+category+'-showcase').getBoundingClientRect().top<=innerHeight*.35)||categoryOrder[0];
 $('#work-switcher-current').textContent=categoryNames[current];
 $('#work-switcher summary').setAttribute('aria-label','작업 카테고리 선택, 현재 '+categoryNames[current]);
 workChoices.forEach(link=>{if(link.getAttribute('href')==='#'+current+'-showcase')link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
// Existing query links continue to open the corresponding anchored gallery.
const requestedCategory=new URLSearchParams(location.search).get('work');
if(categoryOrder.includes(requestedCategory)&&!location.hash)location.hash=requestedCategory+'-showcase';

const navLinks=$$('#floating-nav a'),navSections=navLinks.map(a=>$(a.getAttribute('href')));let scrollQueued=false;
function updateScroll(){const active=[...navSections].reverse().find(section=>section.getBoundingClientRect().top<=innerHeight*.4)||navSections[0];navLinks.forEach(a=>{if(a.getAttribute('href')==='#'+active.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});updateWorkSwitcher();scrollQueued=false;}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}},{passive:true});
function fitTitle(){const title=$('#hero-title'),parts=[...title.children],mobile=innerWidth<=640;const width=mobile?Math.max(...parts.map(p=>p.offsetWidth)):parts.reduce((sum,p)=>sum+p.offsetWidth,0)+parseFloat(getComputedStyle(title).gap);title.style.setProperty('--title-scale',Math.min(.88,(title.clientWidth-24)/width));}
addEventListener('resize',()=>{fitTitle();updateScroll();},{passive:true});document.fonts.ready.then(fitTitle);
fitTitle();updateScroll();

// Same-origin homepage previews scroll their actual documents; hover pauses them.
$$('[data-desktop-preview]').forEach(viewport=>{
 const card=viewport.closest('.project-card'),page=viewport.querySelector('.desktop-preview-page'),frame=page.querySelector('iframe');
 let ready=false,visible=false,hovering=false,last=0,hold=0,position=0,animation=null;
 function size(){page.style.setProperty('--preview-scale',String(viewport.clientWidth/1440));}
 function stop(){if(animation!==null)cancelAnimationFrame(animation);animation=null;last=0;}
 function start(){if(animation===null&&ready&&visible&&!hovering&&!document.hidden&&!reduceMotion.matches)animation=requestAnimationFrame(tick);}
 function tick(time){animation=null;if(!ready||!visible||hovering||document.hidden||reduceMotion.matches){last=0;return;}
  const elapsed=last?Math.min(time-last,60):0;last=time;
  const documentHeight=frame.contentDocument?.scrollingElement?.scrollHeight||0;
  const end=Math.min(Math.max(0,documentHeight-frame.clientHeight),2200);
  if(position<end-1){position=Math.min(end,position+elapsed*.038);frame.contentWindow.scrollTo(0,position);hold=0;}
  else if(!hold)hold=time;
  else if(time-hold>2200){position=0;frame.contentWindow.scrollTo(0,0);hold=0;}
  animation=requestAnimationFrame(tick);
 }
 new ResizeObserver(size).observe(viewport);size();
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();},{threshold:.15}).observe(viewport);
 frame.addEventListener('load',()=>{try{ready=Boolean(frame.contentDocument?.scrollingElement);}catch{ready=false;}position=0;hold=0;start();});
 frame.addEventListener('error',()=>{ready=false;stop();});
 card.addEventListener('mouseenter',()=>{hovering=true;stop();});
 card.addEventListener('mouseleave',()=>{hovering=false;start();});
 card.addEventListener('focusin',()=>{hovering=true;stop();});
 card.addEventListener('focusout',()=>{hovering=false;start();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
 reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches)stop();else start();});
});


// Interactive command prompt. Input is handled locally, never by a shell.
const terminalForm=document.querySelector('.terminal-form');
if(terminalForm){
 const input=document.querySelector('#terminal-input'),output=document.querySelector('#terminal-output');
 const history=[];let cursor=0,draft='';
 const replies={help:'help     Available commands\nwhoami   Designer profile\nabout    Meet the designer\nwork     Selected work\ncontact  Get in touch\nclear    Clear this session',whoami:'KIM HYEONA\nComputer Engineering / UX/UI Design\nThink. Design. Build.'};
 function run(command){
  const value=command.trim();if(!value)return;
  history.push(value);cursor=history.length;input.value='';draft='';
  const key=value.toLowerCase();
  if(key==='clear'||key==='cls'){output.replaceChildren();return;}
  const entry=document.createElement('div'),prompt=document.createElement('p'),reply=document.createElement('p');
  prompt.className='terminal-echo';prompt.textContent='C:\\HYEONA> '+value;entry.append(prompt);
  const targets={about:'#about',work:'#work',contact:'#contact'};
  if(targets[key]){
   reply.textContent='Opening '+key+'...';
   const target=document.querySelector(targets[key]);
   if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth'});}
  }else reply.textContent=replies[key]||'Unknown command: '+value+'\nType help to see available commands.';
  entry.append(reply);output.append(entry);
  while(output.children.length>20)output.firstElementChild.remove();
  output.scrollTop=output.scrollHeight;
 }
 terminalForm.addEventListener('submit',event=>{event.preventDefault();run(input.value);});
 input.addEventListener('keydown',event=>{
  if(event.isComposing)return;
  if(event.key==='ArrowUp'||event.key==='ArrowDown'){
   event.preventDefault();if(cursor===history.length)draft=input.value;
   cursor=Math.max(0,Math.min(history.length,cursor+(event.key==='ArrowUp'?-1:1)));
   input.value=cursor===history.length?draft:history[cursor];
  }
 });
 document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.command;input.focus({preventScroll:true});}));
}
const detailCase=document.querySelector('.detail-case-study');
if(detailCase){
 const dock=detailCase.querySelector('.case-controls');dock.classList.add('case-dock');document.body.append(dock);
 const buttons=dock.querySelectorAll('button');
 buttons.forEach((button,index)=>{button.textContent=index?'\u2192':'\u2190';button.setAttribute('aria-label',index?'Next project':'Previous project');button.addEventListener('click',()=>detailCase.querySelector('.case-header').scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'start'}));});
 const label=document.createElement('span');label.className='case-dock-label';dock.insertBefore(label,buttons[1]);
 const updateDock=()=>{const rect=detailCase.getBoundingClientRect();dock.hidden=rect.top>innerHeight*.65||rect.bottom<180;label.textContent=detailCase.querySelector('h4').textContent;};
 new MutationObserver(updateDock).observe(detailCase.querySelector('h4'),{childList:true,subtree:true,characterData:true});
 addEventListener('scroll',updateDock,{passive:true});addEventListener('resize',updateDock,{passive:true});updateDock();
}
