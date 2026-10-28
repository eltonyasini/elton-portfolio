// Editable homepage for the static GitHub Pages export. React and GSAP are
// supplied by the existing app bundle; no additional framework/CDN is loaded.
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
      h('p', {className:'portfolio-kicker'}, content.profile.title),
      h('h1', {id:'portfolio-title'}, 'DESIGN THAT', h('br'), 'MOVES.', h('br'), 'IDEAS THAT WORK.'),
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
  const overlay = document.getElementById('portfolio-intro');
  if (!overlay || overlay.hidden) return;
  let timeline;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finish = () => {
    timeline?.kill();
    overlay.remove();
    clearTimeout(window.portfolioIntroTimeout);
    document.removeEventListener('keydown', finish);
    document.removeEventListener('pointerdown', finish);
    document.removeEventListener('focusin', finish);
    motion.removeEventListener('change', finish);
  };
  document.addEventListener('keydown', finish, {once:true});
  document.addEventListener('pointerdown', finish, {once:true});
  document.addEventListener('focusin', finish, {once:true});
  motion.addEventListener('change', finish);
  if (motion.matches) { finish(); return; }
  timeline = gsap.timeline({onComplete:finish});
  timeline.fromTo(overlay.querySelectorAll('span'), {yPercent:110, opacity:0}, {yPercent:0, opacity:1, duration:0.6, stagger:0.12, ease:'power3.out'})
    .to(overlay, {opacity:0, duration:0.4, ease:'power2.inOut'}, '+=0.25');
}
