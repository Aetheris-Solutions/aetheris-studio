import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../webflow-site/assets/js/aetheris-analytics-consent.v3.js', import.meta.url), 'utf8');
const key = 'aetheris.analyticsConsent.v2';

function page(initial = {}) {
  const storage = new Map(Object.entries(initial));
  const nodes = []; const requests = []; const events = {}; const expired = [];
  let reloads = 0;
  class Element {
    constructor() { this.dataset = {}; this.handlers = {}; this.children = new Map(); }
    setAttribute() {}
    addEventListener(name, fn) { this.handlers[name] = fn; }
    querySelector(selector) {
      if (!this.children.has(selector)) this.children.set(selector, new Element());
      return this.children.get(selector);
    }
    querySelectorAll() {
      return ['denied', 'granted'].map(choice => {
        const child = this.querySelector(choice); child.dataset.consent = choice; return child;
      });
    }
    remove() { const i = nodes.indexOf(this); if (i >= 0) nodes.splice(i, 1); }
  }
  const append = element => nodes.push(element);
  const document = {
    createElement: () => new Element(),
    querySelector: selector => nodes.find(node => selector.startsWith('.') ? '.' + node.className === selector : node.src),
    addEventListener: (name, fn) => { events[name] = fn; },
    head: { appendChild: node => { nodes.push(node); requests.push({ src: node.src, consent: [...window.dataLayer] }); }, append: node => { nodes.push(node); requests.push({ src: node.src, consent: [...window.dataLayer] }); } },
    body: { appendChild: append, append },
    get cookie() { return '_ga=old; _ga_TEST=old; _clck=old; necessary=keep'; },
    set cookie(value) { expired.push(value); },
  };
  const window = {
    localStorage: { getItem: name => storage.get(name) || null, setItem: (name, value) => storage.set(name, value) },
    location: { hostname: 'aetherisstudio.com', reload: () => { reloads++; } },
    dispatchEvent() {},
  };
  vm.runInNewContext(source, { window, document, CustomEvent: class {}, Date });
  events.DOMContentLoaded?.();
  function choose(choice) {
    const banner = nodes.find(node => /cookie-banner|analytics-consent/.test(node.className));
    const selector = source.includes('aetheris-cookie-reject') ? '.aetheris-cookie-' + (choice === 'granted' ? 'accept' : 'reject') : choice;
    banner.querySelector(selector).handlers.click();
  }
  function preferences() {
    nodes.find(node => /cookie-preferences|analytics-preferences/.test(node.className)).handlers.click();
  }
  return { window, storage, requests, expired, nodes, choose, preferences, reloads: () => reloads };
}

test('new or legacy consent does not load analytics; reject remains network-free', () => {
  for (const initial of [{}, { 'aetheris.analyticsConsent': 'granted' }]) {
    const p = page(initial);
    assert.equal(p.requests.length, 0);
    assert.equal(p.window.clarity, undefined);
    p.choose('denied');
    assert.equal(p.requests.length, 0);
    assert.equal(p.storage.get(key), 'denied');
    assert.equal(p.reloads(), 0);
  }
});

test('accept sends consent before loading one GTM instance and grants no advertising consent', () => {
  const p = page(); p.choose('granted');
  assert.equal(p.requests.length, 1);
  const updates = p.requests[0].consent.filter(args => args[0] === 'consent' && args[1] === 'update');
  assert.equal(updates.at(-1)[2].analytics_storage, 'granted');
  assert.equal(updates.at(-1)[2].ad_storage, 'denied');
  const clarityConsent = p.window.clarity.q.find(args => args[0] === 'consentv2');
  assert.equal(clarityConsent[1].analytics_Storage, 'granted');
  assert.equal(clarityConsent[1].ad_Storage, 'denied');
  p.preferences(); p.choose('granted');
  assert.equal(p.requests.length, 1);
});

test('withdrawal stops Clarity, clears analytics cookies and reloads into denied state', () => {
  const p = page({ [key]: 'granted' });
  assert.equal(p.requests.length, 1);
  p.preferences(); p.choose('denied');
  assert.equal(p.storage.get(key), 'denied');
  assert.ok(p.window.clarity.q.some(args => args[0] === 'stop'));
  assert.ok(p.expired.some(cookie => cookie.startsWith('_clck=') && cookie.includes('Max-Age=0')));
  assert.ok(!p.expired.some(cookie => cookie.startsWith('necessary=')));
  assert.equal(p.reloads(), 1);
  const next = page({ [key]: p.storage.get(key) });
  assert.equal(next.requests.length, 0);
});
