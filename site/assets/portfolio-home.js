// Editable homepage for the static GitHub Pages export. React and GSAP are
// supplied by the existing app bundle; no additional framework/CDN is loaded.
// The compiled hosting bundle passes GSAP to playIntro. Reuse that instance for
// the homepage's role loop instead of loading a second animation library.
let animationEngine = null;

export function renderHome({content, route}, {React, projectHref, copy, Image}) {
  const h = React.createElement;
  const ref = React.useRef(null);
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
  React.useEffect(() => {
    const word = ref.current?.querySelector('.portfolio-hero-role-word');
    const hero = ref.current?.querySelector('.portfolio-hero');
    if (!word || !hero) return;
    const phrases = ['A DESIGNER', 'AN ANIMATOR', 'A SOFTWARE DEVELOPER'];
    let current = 0;
    let cycle = null;
    let observer = null;
    let visible = true;
    let onVisibility = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const startCycle = () => {
      if (cycle || reducedMotion.matches || !animationEngine || !word.isConnected) return;
      const gsap = animationEngine;
      cycle = gsap.timeline({repeat:-1, repeatDelay:0.15});
      cycle.to(word, {y:-16, opacity:0, duration:0.25, delay:2.1, ease:'power2.in'})
        .call(() => {current=(current+1)%phrases.length; word.textContent=phrases[current];})
        .fromTo(word, {y:16, opacity:0}, {y:0, opacity:1, duration:0.38, ease:'power3.out'});
      onVisibility = () => {
        if (!cycle) return;
        (!document.hidden && visible) ? cycle.resume() : cycle.pause();
      };
      document.addEventListener('visibilitychange', onVisibility);
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(entries => {
          visible = Boolean(entries[0]?.isIntersecting);
          onVisibility?.();
        }, {threshold:0.05});
        observer.observe(hero);
      }
    };
    if (document.documentElement.classList.contains('portfolio-intro-active')) {
      window.addEventListener('portfolio:intro-complete', startCycle, {once:true});
    } else {
      startCycle();
    }
    return () => {
      window.removeEventListener('portfolio:intro-complete', startCycle);
      observer?.disconnect();
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
      cycle?.kill();
      // The loop is scoped to this home component and dies when it unmounts.
    };
  }, []);
  const featuredIds = ['comit-capital', 'motion-animation', 'unique-accessories'];
  const featured = featuredIds.map(id => content.projects.find(p => p.id === id)).filter(Boolean);
  const remaining = content.projects.filter(p => !featuredIds.includes(p.id));
  const project = (p, index, compact = false) => {
    const summary = copy.selected.find(item => item.id === p.id) || p;
    return h('article', {key:p.id, id:'work-'+p.id, className:'portfolio-project '+(compact ? 'portfolio-card' : 'portfolio-feature'), 'aria-labelledby':'home-title-'+p.id},
      h('a', {href:projectHref(p.id), className:'portfolio-project-image', tabIndex:-1, 'aria-hidden':true},
        h(Image, {src:p.cover, alt:'', loading:index === 0 && !compact ? 'eager' : 'lazy', fetchPriority:index === 0 && !compact ? 'high' : 'low', decoding:'async', sizes:compact ? '(max-width:600px) 92vw, (max-width:1000px) 45vw, 30vw' : '(max-width:600px) 92vw, (max-width:1000px) 90vw, 65vw'})),
      h('div', {className:'portfolio-project-copy'},
        h('p', {className:'portfolio-kicker'}, summary.category),
        h('h3', {id:'home-title-'+p.id}, h('a', {href:projectHref(p.id)}, p.title)),
        h('p', {className:'portfolio-description'}, summary.description || p.overview)));
  };
  return h('div', {className:'layout-home portfolio-home-v2', ref},
    h('section', {className:'portfolio-hero', 'aria-labelledby':'portfolio-title'},
      h('div', {className:'portfolio-hero-centre'},
        h('p', {className:'portfolio-hero-prelude'}, 'I AM'),
        h('h1', {id:'portfolio-title', className:'portfolio-hero-name', 'data-hero-name':true},
          h('span', null, 'ELTON'), h('span', null, 'YASINI')),
        h('p', {className:'portfolio-hero-role', 'aria-label':'Designer, animator and software developer'},
          h('span', {className:'portfolio-hero-role-word', 'aria-hidden':true}, 'A DESIGNER'))),
      h('div', {className:'portfolio-hero-bottom'},
        h('p', null, content.profile.intro),
        h('a', {href:'#/work', className:'portfolio-link'}, 'Explore my work'))),
    h('section', {id:'work', className:'portfolio-work', 'aria-labelledby':'portfolio-work-title'},
      h('div', {className:'portfolio-section-heading'}, h('h2', {id:'portfolio-work-title'}, 'Selected work'), h('span', null, 'DESIGN / MOTION / CODE')),
      h('div', {className:'portfolio-featured'}, featured.map((p, i) => project(p, i))),
      h('div', {className:'portfolio-section-heading portfolio-more-heading'}, h('h2', null, 'More to explore'), h('span', null, 'A FEW MORE PERSPECTIVES')),
      h('div', {className:'portfolio-grid'}, remaining.map((p, i) => project(p, i, true)))),
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
  animationEngine = gsap;
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
    document.removeEventListener('keydown', finish);
    document.removeEventListener('pointerdown', finish);
    motion.removeEventListener('change', finish);
    window.removeEventListener('hashchange', onRouteChange);
    window.dispatchEvent(new Event('portfolio:intro-complete'));
  };
  const onRouteChange = () => {
    if (/^#\\/(?:work\\/|project\\/)/.test(location.hash)) finish();
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
    const bottom = document.querySelector('.portfolio-hero-bottom');
    if (!floatingName || !label || !role || !bottom) {finish();return true;}
    const start = floatingName.getBoundingClientRect();
    const end = name.getBoundingClientRect();
    if (!start.width || !end.width) {finish();return true;}
    const scale = end.width/start.width;
    const dx = end.left + end.width/2 - start.left - start.width/2;
    const dy = end.top + end.height/2 - start.top - start.height/2;
    gsap.set([label,role,bottom], {opacity:0, y:20});
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
      .to(role, {opacity:1, y:0, duration:0.48, ease:'power3.out'}, 'handoff+=0.59')
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
