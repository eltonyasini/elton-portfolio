import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {playIntro} from '../site/assets/portfolio-home.js';

const root = path.resolve(import.meta.dirname, '..');
const site = path.join(root, 'site');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'export-manifest.json')));
for (const entry of manifest.files) {
  const bytes = fs.readFileSync(path.join(site, entry.path));
  assert.equal(bytes.length, entry.bytes, entry.path);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
}
const portfolio = JSON.parse(fs.readFileSync(path.join(site, 'content/portfolio.json')));
assert.equal(portfolio.projects.length, 9);
assert.equal(portfolio.profile.email, 'elton.yasini@gmail.com');
for (const project of portfolio.projects) assert.ok(fs.existsSync(path.join(site, project.cover.replace('/elton-portfolio/', ''))));

// Exercise first-visit, repeat-visit, reduced-motion and storage-unavailable boot.
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
for (const [seen, reduced, storageError, hidden] of [[false,false,false,false],[true,false,false,true],[false,true,false,true],[false,false,true,false]]) {
  const overlay = {hidden:false, removed:false, remove(){this.removed=true;}};
  let fallback;
  const context = {document:{getElementById:()=>overlay},window:{},sessionStorage:{getItem(){if(storageError)throw Error();return seen?'1':null;},setItem(){}},matchMedia:()=>({matches:reduced}),setTimeout(fn,delay){assert.equal(delay,2400);fallback=fn;}};
  vm.runInNewContext(bootstrap, context);
  assert.equal(overlay.hidden, hidden);
  fallback(); assert.ok(overlay.removed);
}

// Verify GSAP sequence and dismissal/cleanup without waiting through animations.
for (const reduced of [false, true]) {
  const events = new Map();
  let removed=false, killed=false, completed, calls=[];
  const overlay={hidden:false,querySelectorAll:()=>['Elton','Yasini'],remove(){removed=true;}};
  globalThis.document={getElementById:()=>overlay,addEventListener:(k,v)=>events.set(k,v),removeEventListener:k=>events.delete(k)};
  globalThis.window={};
  globalThis.matchMedia=()=>({matches:reduced,addEventListener:(k,v)=>events.set('motion',v),removeEventListener:()=>events.delete('motion')});
  const timeline={fromTo(...args){calls.push(args);return this;},to(...args){calls.push(args);return this;},kill(){killed=true;}};
  playIntro({timeline(options){completed=options.onComplete;return timeline;}});
  if(reduced){assert.ok(removed);assert.equal(calls.length,0);} else {
    assert.equal(calls.length,2);
    assert.equal(calls[0][2].duration,0.6);
    assert.ok(events.has('keydown'));
    events.get('keydown')();
    assert.ok(removed && killed);
    assert.equal(events.size,0);
    completed();
  }
}
console.log(`PASS: ${manifest.files.length} asset hashes, 9 covers, intro lifecycle, repeat visits, reduced motion and failure fallback.`);
