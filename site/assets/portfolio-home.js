
function ProgressiveCover({cover,title,index,React}) {
  const h=React.createElement;
  const holder=React.useRef(null);
  const [active,setActive]=React.useState(false);
  const [fallback,setFallback]=React.useState(false);
  const [loaded,setLoaded]=React.useState(false);
  React.useEffect(()=>{
    const node=holder.current;
    if(!node)return;
    let timer=null;
    const begin=()=>{timer=setTimeout(()=>setActive(true),180+index*145)};
    if(!('IntersectionObserver' in window)){begin();return()=>clearTimeout(timer)}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();begin()}
    },{rootMargin:'850px 0px',threshold:0});
    observer.observe(node);
    return()=>{observer.disconnect();clearTimeout(timer)};
  },[index]);
  const webp=cover.replace(/\.png$/i,'-preview.webp');
  return h('span',{ref:holder,className:'portfolio-cover-stage'+(loaded?' is-ready':'')},
    active && h('img',{src:fallback?cover:webp,alt:title+' project cover',loading:'lazy',decoding:'async',fetchPriority:'low',
      onLoad:()=>setLoaded(true),onError:()=>{if(!fallback)setFallback(true)},
      width:2048,height:819}));
}

// Editable homepage for the static GitHub Pages export. React and GSAP are
// supplied by the existing app bundle; no additional framework/CDN is loaded.
export function renderHome({content, route}, {React, projectHref, copy, Image, gsap}) {
  const h = React.createElement;
  const ref = React.useRef(null);
  React.useLayoutEffect(() => swimTools(ref.current, gsap), []);
  React.useLayoutEffect(() => {
    const scroll = () => {
      const [path, query = ''] = route.split('?');
      const focus = new URLSearchParams(query).get('focus');
      const id = focus ? 'work-' + focus : path.replace(/^#\/?/, '');
      if (id) document.getElementById(id)?.scrollIntoView({block: 'start', behavior: 'instant'});
    };
    const frame = (route.includes('focus=') || /^#\/?(?:work|about|contact)/.test(route)) ? requestAnimationFrame(scroll) : null;
    const showWork = () => document.getElementById('work')?.scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    window.addEventListener('portfolio:show-work', showWork);
    return () => { if (frame !== null) cancelAnimationFrame(frame); window.removeEventListener('portfolio:show-work', showWork); };
  }, [route]);
  const projects = content.projects;
  const project = (p, index) =>
    h('article', {key:p.id, id:'work-'+p.id, className:'portfolio-project portfolio-grid-item'},
      h('a', {href:projectHref(p.id), className:'portfolio-project-image', 'aria-label':'View '+p.title+' project'},
        h(ProgressiveCover, {cover:p.cover, title:p.title, index, React})));
  return h('div', {className:'layout-home portfolio-home-v2', ref},
    h('section', {className:'portfolio-hero', 'aria-labelledby':'portfolio-title'},
      h('div', {className:'portfolio-tool-tank', 'aria-hidden':true}, TOOL_ICONS.map(([id,label]) => h('img', {key:id,className:'portfolio-swimmer',src:'/elton-portfolio/media/tool-icons/'+id+'.webp',alt:'',width:500,height:500,draggable:false}))),
      h('div', {className:'portfolio-hero-centre'},
        h('p', {className:'portfolio-hero-prelude'}, 'I AM'),
        h('h1', {id:'portfolio-title', className:'portfolio-hero-name', 'data-hero-name':true},
          h('span', null, 'ELTON'), h('span', null, 'YASINI')),
        h('p', {className:'portfolio-hero-role'},
          h('span', {className:'portfolio-role-item'}, 'A DESIGNER'),
          h('span', {className:'portfolio-role-item'}, 'AN ANIMATOR'),
          h('span', {className:'portfolio-role-item'}, 'A SOFTWARE DEVELOPER'))),
      h('div', {className:'portfolio-hero-bottom'},
        h('p', null, content.profile.intro),
        h('a', {href:'#/work', className:'portfolio-link'}, 'Explore my work'))),
    h('section', {id:'work', className:'portfolio-work', 'aria-labelledby':'portfolio-work-title'},
      h('div', {className:'portfolio-section-heading'}, h('h2', {id:'portfolio-work-title'}, 'Selected work')),
      h('div', {className:'portfolio-grid portfolio-unified-grid'}, projects.map(project))),
    h('section', {id:'about', className:'portfolio-about', 'aria-labelledby':'portfolio-about-title'},
      h('div', null, h('p', {className:'portfolio-kicker'}, 'The person behind the work'), h('h2', {id:'portfolio-about-title'}, 'Curious by nature. ', h('br'), 'Creative by practice.')),
      h('div', null, h('p', {className:'portfolio-bio'}, content.profile.bio.split('\n\n')[0]),
        h('div', {className:'portfolio-services'}, copy.aboutServices.map(s => h('div', {key:s.title}, h('h3', null, s.title), h('p', null, s.description)))))),
    h('section', {id:'contact', className:'portfolio-contact', 'aria-labelledby':'portfolio-contact-title'},
      h('p', {className:'portfolio-kicker'}, 'Have something in mind?'),
      h('h2', {id:'portfolio-contact-title'}, "Let's make", h('br'), 'something matter.'),
      h('p', null, copy.contact.fields.Body),
      h('a', {className:'portfolio-email', href:'mailto:'+content.profile.email}, content.profile.email),
      h('div', {className:'portfolio-contact-footer'}, h('span', null, 'BASED IN BULAWAYO · OPEN TO COLLABORATION'), h('a', {href:content.profile.github, target:'_blank', rel:'noopener noreferrer'}, 'GitHub'))));
}

export function playIntro(gsap) {
  const overlay = document.getElementById('portfolio-intro');
  if (!overlay || overlay.hidden) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const activeClass = 'portfolio-intro-active';
  const root = document.documentElement;
  let timeline = null;
  let observer = null;
  let finished = false;
  let fallback = null;
  const finish = () => {
    if (finished) return;
    finished = true;
    observer?.disconnect();
    clearTimeout(fallback);
    clearTimeout(window.portfolioIntroTimeout);
    timeline?.kill();
    overlay.remove();
    root.classList.remove(activeClass);
    // An interrupted intro must never leave the real hero invisible.
    for (const element of document.querySelectorAll(
      '.portfolio-hero-name, .portfolio-hero-prelude, .portfolio-hero-role, .portfolio-role-item, .portfolio-hero-bottom'
    )) {
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
    }
    document.removeEventListener('keydown', finish);
    document.removeEventListener('pointerdown', finish);
    motion.removeEventListener('change', finish);
    window.removeEventListener('hashchange', onRouteChange);
    window.dispatchEvent(new Event('portfolio:intro-complete'));
  };
  const onRouteChange = () => {
    if (/^#\/(?:work\/|project\/)/.test(location.hash)) finish();
  };
  if (motion.matches) { finish(); return; }
  const begin = () => {
    const name = document.querySelector('.portfolio-home-v2 [data-hero-name]');
    if (!name || !overlay.isConnected || timeline || finished) return false;
    observer?.disconnect();
    const floatingName = overlay.firstElementChild;
    const floatingLetters = floatingName.querySelectorAll('span');
    const label = document.querySelector('.portfolio-hero-prelude');
    const role = document.querySelector('.portfolio-hero-role');
    const roleItems = Array.from(role?.querySelectorAll('.portfolio-role-item') || []);
    const bottom = document.querySelector('.portfolio-hero-bottom');
    if (!floatingName || !label || !role || !bottom) {finish();return true;}
    const start = floatingName.getBoundingClientRect();
    const end = name.getBoundingClientRect();
    if (!start.width || !end.width) {finish();return true;}
    const scale = end.width/start.width;
    const dx = end.left + end.width/2 - start.left - start.width/2;
    const dy = end.top + end.height/2 - start.top - start.height/2;
    gsap.set([label,bottom], {opacity:0, y:20});
    // Reveal the three disciplines once as the name lands — never rotate them.
    gsap.set(role, {opacity:1});
    gsap.set(roleItems, {opacity:0, y:20});
    gsap.set(name, {opacity:0});
    timeline = gsap.timeline({onComplete:finish});
    timeline.fromTo(floatingLetters, {yPercent:110, opacity:0},
      {yPercent:0, opacity:1, duration:0.55, stagger:0.1, ease:'power3.out'})
      .to({}, {duration:0.2})
      .addLabel('handoff')
      .to(overlay, {backgroundColor:'rgba(248,248,246,0)', duration:1.05, ease:'power2.inOut'}, 'handoff')
      .to(floatingName, {x:dx, y:dy, scale, color:'#101010',
        duration:1.05, ease:'power3.inOut', transformOrigin:'center center'}, 'handoff')
      .to(label, {opacity:1, y:0, duration:0.48, ease:'power3.out'}, 'handoff+=0.43')
      .to(roleItems, {opacity:1, y:0, duration:0.48, stagger:0.11, ease:'power3.out'}, 'handoff+=0.58')
      .to(bottom, {opacity:1, y:0, duration:0.52, ease:'power3.out'}, 'handoff+=0.75')
      .set(name, {opacity:1}, 'handoff+=0.98')
      .to(overlay, {opacity:0, duration:0.14}, 'handoff+=1.00');
    return true;
  };
  document.addEventListener('keydown', finish, {once:true});
  document.addEventListener('pointerdown', finish, {once:true});
  motion.addEventListener('change', finish);
  window.addEventListener('hashchange', onRouteChange);
  fallback = window.setTimeout(finish, 5100);
  if (!begin()) {
    observer = new MutationObserver(() => begin());
    observer.observe(document.getElementById('root') || document.body, {childList:true, subtree:true});
  }
}

const TOOL_ICONS = [
 ['photoshop','Photoshop'],['after-effects','After Effects'],['illustrator','Illustrator'],
 ['python','Python'],['figma','Figma'],['premiere','Premiere Pro']
];

// One GSAP ticker, six transform-only updates. No layout reads in the animation loop.
function swimTools(root, gsap) {
 const hero=root?.querySelector('.portfolio-hero');
 if(!hero || !gsap) return;
 const nodes=[...hero.querySelectorAll('.portfolio-swimmer')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let width=0,height=0,rect,blocked=[],visible=true,started=false,ticking=false,elapsed=0;
 const pointer={x:-10000,y:-10000,active:false};
 const fish=nodes.map((node,i)=>({node,x:0,y:0,vx:0,vy:0,r:24,phase:i*2.399,speed:10+i*1.7,frequency:.19+i*.037,turn:i%2?1:-1,
  setX:gsap.quickSetter(node,'x','px'),setY:gsap.quickSetter(node,'y','px'),
  setR:gsap.quickSetter(node,'rotation','deg')}));
 function measure(){
  rect=hero.getBoundingClientRect();width=hero.clientWidth;height=hero.clientHeight;
  blocked=[...hero.querySelectorAll('.portfolio-hero-prelude,.portfolio-hero-name,.portfolio-hero-role,.portfolio-hero-bottom')].map(e=>{
   const b=e.getBoundingClientRect();return {l:b.left-rect.left-18,r:b.right-rect.left+18,t:b.top-rect.top-14,b:b.bottom-rect.top+14};
  });
  const positions=[[.13,.18],[.5,.12],[.85,.22],[.17,.69],[.52,.74],[.84,.67]];
  fish.forEach((f,i)=>{f.r=f.node.offsetWidth/2+6;f.x=width*positions[i][0];f.y=height*positions[i][1];constrain(f);paint(f)});
 }
 function constrain(f){
  for(const b of blocked){
   if(f.x>b.l-f.r&&f.x<b.r+f.r&&f.y>b.t-f.r&&f.y<b.b+f.r){
    const options=[[Math.abs(f.x-(b.l-f.r)),0,b.l-f.r],[Math.abs(f.x-(b.r+f.r)),0,b.r+f.r],[Math.abs(f.y-(b.t-f.r)),1,b.t-f.r],[Math.abs(f.y-(b.b+f.r)),1,b.b+f.r]].sort((a,b)=>a[0]-b[0]);
    const o=options[0];if(o[1]){f.y=o[2];f.vy*=-.6}else{f.x=o[2];f.vx*=-.6}
   }
  }
  f.x=Math.max(f.r,Math.min(width-f.r,f.x));f.y=Math.max(f.r,Math.min(height-f.r,f.y));
 }

 // Cursor proximity changes acceleration, never position: movement retains inertia.
 function repel(f){
  if(!pointer.active)return {x:0,y:0};
  const dx=f.x-pointer.x,dy=f.y-pointer.y,d=Math.hypot(dx,dy),range=210;
  if(d>=range)return {x:0,y:0};
  const nx=d>.1?dx/d:Math.cos(f.phase),ny=d>.1?dy/d:Math.sin(f.phase);
  const strength=820*Math.pow(1-d/range,2);
  return {x:nx*strength-ny*strength*.26*f.turn,y:ny*strength+nx*strength*.26*f.turn};
 }
 function paint(f){f.setX(f.x);f.setY(f.y);f.setR(Math.sin(elapsed*f.frequency+f.phase)*9)}
 function tick(_,delta){
  const dt=Math.min(delta/1000,.032);elapsed+=dt;
  // Compute all steering from the same frame before integrating any positions.
  const forces=fish.map(f=>{
   const push=repel(f);
   let ax=(Math.cos(elapsed*f.frequency+f.phase)*f.speed-f.vx)*1.15+push.x;
   let ay=(Math.sin(elapsed*(f.frequency*.83)+f.phase*1.7)*f.speed*.75-f.vy)*1.15+push.y;
   for(const other of fish){
    if(other===f)continue;
    const dx=f.x-other.x,dy=f.y-other.y,d=Math.hypot(dx,dy),gap=f.r+other.r+38;
    if(d<gap){
     const nx=d>.1?dx/d:Math.cos(f.phase),ny=d>.1?dy/d:Math.sin(f.phase);
     const force=220*Math.pow(1-d/gap,2);
     ax+=nx*force;ay+=ny*force;
    }
   }
   // Soft steering before hard safety boundaries avoids sticking to text or walls.
   for(const b of blocked){
    const x=Math.max(b.l,Math.min(b.r,f.x)),y=Math.max(b.t,Math.min(b.b,f.y));
    const dx=f.x-x,dy=f.y-y,d=Math.hypot(dx,dy),range=f.r+48;
    if(d>0&&d<range){const force=260*Math.pow(1-d/range,2);ax+=dx/d*force;ay+=dy/d*force}
   }
   const edge=72;
   ax+=Math.max(0,edge-f.x)*2.5-Math.max(0,f.x-(width-edge))*2.5;
   ay+=Math.max(0,edge-f.y)*2.5-Math.max(0,f.y-(height-edge))*2.5;
   return {x:ax,y:ay};
  });
  fish.forEach((f,i)=>{
   f.vx+=forces[i].x*dt;f.vy+=forces[i].y*dt;
   const speed=Math.hypot(f.vx,f.vy),cap=230;
   if(speed>cap){f.vx*=cap/speed;f.vy*=cap/speed}
   f.x+=f.vx*dt;f.y+=f.vy*dt;constrain(f);paint(f);
  });
 }
 function sync(){
  const run=started&&visible&&!document.hidden&&!reduced.matches;
  if(run&&!ticking){gsap.ticker.add(tick);ticking=true}
  if(!run&&ticking){gsap.ticker.remove(tick);ticking=false}
 }
 function start(){started=true;gsap.to(nodes,{opacity:.72,duration:reduced.matches?0:.8,stagger:.07});sync()}
 function move(e){
  if(e.pointerType==='touch'||reduced.matches)return;
  pointer.x=e.clientX-rect.left;pointer.y=e.clientY-rect.top;pointer.active=true;

 }
 function leave(){pointer.active=false}
 function scroll(){rect=hero.getBoundingClientRect();leave()}
 const ro=new ResizeObserver(measure);ro.observe(hero);
 const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()});io.observe(hero);
 hero.addEventListener('pointermove',move,{passive:true});hero.addEventListener('pointerleave',leave);
 window.addEventListener('scroll',scroll,{passive:true});
 window.addEventListener('portfolio:intro-complete',start);
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 measure();if(!document.documentElement.classList.contains('portfolio-intro-active'))start();
 return ()=>{gsap.ticker.remove(tick);gsap.killTweensOf(nodes);ro.disconnect();io.disconnect();
 hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);
 window.removeEventListener('scroll',scroll);window.removeEventListener('portfolio:intro-complete',start);
 document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync)};
}
