"""Apply the documented UI refinement to this exact static export.

Port portfolio-home.js and portfolio-refinement.css into the maintained source
before re-exporting. This adapter deliberately fails on an unknown app bundle.
"""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[1]
site = root / 'site'
original = site / 'assets/app-Dao03Kfd.js'
updated = site / 'assets/app-refined-20261028.js'
if original.exists():
    s = original.read_text()
    start = s.index('function RD({content:c,route:p})')
    end = s.index('function Iu(', start)
    replacement = 'function RD({content:c,route:p}){return renderHome({content:c,route:p},{React:K,projectHref:qd,copy:In,Image:g0})}'
    s = s[:start] + replacement + s[end:]
    # Scroll reveal content remains legible before a trigger fires.
    s = s.replace('{opacity:0,y:18},{opacity:1,y:0,duration:Ee', '{opacity:1,y:8},{opacity:1,y:0,duration:Math.min(Ee,.3)')
    s = s.replace('{opacity:0,clipPath:"inset(0% 0% 12% 0%)"}', '{opacity:1,clipPath:"inset(0% 0% 0% 0%)"}')
    s = 'import {renderHome,playIntro} from "./portfolio-home.js";\n' + s + '\nplayIntro(Da.gsap);\n'
    updated.write_text(s)
    original.unlink()
elif not updated.exists():
    raise SystemExit('Unknown export: port the adapter to the new bundle first.')

intro = '''<div id="portfolio-intro" aria-hidden="true"><div><span>Elton</span><span>Yasini</span></div></div>
<script>
(()=>{const el=document.getElementById('portfolio-intro');
try{if(sessionStorage.getItem('portfolio-intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches){el.hidden=true;}else{sessionStorage.setItem('portfolio-intro-seen','1');}}catch{}
window.portfolioIntroTimeout=setTimeout(()=>el.remove(),2400);
})();
</script>'''
for p in site.rglob('*.html'):
    if '/assets/app-' not in p.read_text():
        continue
    s = p.read_text().replace('app-Dao03Kfd.js', 'app-refined-20261028.js')
    if 'portfolio-refinement.css' not in s:
        s = s.replace('</head>', '<link rel="stylesheet" href="/elton-portfolio/assets/portfolio-refinement.css"></head>')
    if 'id="portfolio-intro"' not in s:
        s = s.replace('<body>', '<body>'+intro)
    p.write_text(s)
data_file = site / 'content/portfolio.json'
data = json.loads(data_file.read_text())
data['profile']['email'] = 'elton.yasini@gmail.com'
data['profile']['github'] = 'https://github.com/eltonyasini'
data_file.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':'))+'\n')
manifest_path = root / 'export-manifest.json'
manifest = json.loads(manifest_path.read_text())
manifest['files'] = [{'path': str(p.relative_to(site)), 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(site.rglob('*')) if p.is_file() and (not p.name.startswith('.') or p.name == '.nojekyll')]
manifest_path.write_text(json.dumps(manifest, indent=2)+'\n')
print('Refinement applied; manifest updated.')
