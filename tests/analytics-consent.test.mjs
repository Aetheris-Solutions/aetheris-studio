import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../webflow-site/assets/js/aetheris-analytics-consent.v3.js', import.meta.url), 'utf8');
const key = 'aetheris.analyticsConsent.v2';
const adsKey = 'aetheris.adsConsent.v1';

function page(initial = {}) {
  const storage = new Map(Object.entries(initial));
  const nodes = []; const requests = []; const events = {}; const expired = []; const announced = [];
  const windowEvents = {};
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
    get cookie() { return '_ga=old; _ga_TEST=old; _gac_gb_123456=old; _clck=old; _gcl_au=old; _gcl_aw=old; necessary=keep'; },
    set cookie(value) { expired.push(value); },
  };
  const window = {
    addEventListener: (name, fn) => { (windowEvents[name] ??= []).push(fn); },
    localStorage: {
      getItem: name => storage.get(name) || null,
      setItem: (name, value) => storage.set(name, value),
      removeItem: name => storage.delete(name),
    },
    location: { hostname: 'aetherisstudio.com', reload: () => { reloads++; } },
    dispatchEvent: event => announced.push({ type: event.type, ...event.detail }),
  };
  class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } }
  vm.runInNewContext(source, { window, document, CustomEvent, Date });
  events.DOMContentLoaded?.();
  function choose(choice) {
    const banner = nodes.find(node => /cookie-banner|analytics-consent/.test(node.className));
    const selector = source.includes('aetheris-cookie-reject') ? '.aetheris-cookie-' + (choice === 'granted' ? 'accept' : 'reject') : choice;
    banner.querySelector(selector).handlers.click();
  }
  function preferences() {
    nodes.find(node => /cookie-preferences|analytics-preferences/.test(node.className)).handlers.click();
  }
  // Delivers a window event, such as pageshow or storage, to the listeners the script added.
  const fire = (type, init = {}) => (windowEvents[type] ?? []).forEach(fn => fn({ type, ...init }));
  const shows = className => nodes.some(node => node.className === className);
  return { window, storage, requests, expired, announced, nodes, choose, preferences, fire, shows, reloads: () => reloads };
}

const wasExpired = (p, name) => p.expired.some(cookie => cookie.startsWith(name + '=') && cookie.includes('Max-Age=0'));
const expiredAdCookies = p => ['_gcl_au', '_gcl_aw'].filter(name => wasExpired(p, name));
const lastConsentUpdate = p => p.window.dataLayer.filter(args => args[0] === 'consent' && args[1] === 'update').at(-1)[2];

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

test('accept never grants advertising measurement, and every choice is announced with ads off', () => {
  const p = page(); p.choose('granted');
  assert.equal(p.storage.has(adsKey), false);
  assert.deepEqual(p.announced, [{ type: 'aetheris:consent', analytics: true, ads: false }]);
  p.preferences(); p.choose('denied');
  assert.deepEqual(p.announced.at(-1), { type: 'aetheris:consent', analytics: false, ads: false });
  assert.deepEqual(page({ [key]: 'granted' }).announced, [{ type: 'aetheris:consent', analytics: true, ads: false }]);
});

test('a campaign advertising grant survives page loads until Reject withdraws it and clears the ad click', () => {
  // A campaign visitor who allowed only advertising measurement opens a main-site page.
  const p = page({ [key]: 'denied', [adsKey]: 'granted', _gcl_ls: '{}' });
  assert.deepEqual(expiredAdCookies(p), []);
  assert.equal(p.storage.get('_gcl_ls'), '{}');
  p.preferences(); p.choose('denied');
  assert.equal(p.storage.get(adsKey), 'denied');
  assert.deepEqual(expiredAdCookies(p), ['_gcl_au', '_gcl_aw']);
  assert.equal(p.storage.has('_gcl_ls'), false);
  assert.ok(!p.expired.some(cookie => cookie.startsWith('necessary=')));
  assert.equal(p.requests.length, 0);
});

test('withdrawal after Accept also withdraws advertising measurement', () => {
  const p = page({ [key]: 'granted', [adsKey]: 'granted' });
  assert.equal(p.requests.length, 1);
  assert.deepEqual(expiredAdCookies(p), []);
  assert.equal(wasExpired(p, '_gac_gb_123456'), false);
  p.preferences(); p.choose('denied');
  assert.equal(p.storage.get(key), 'denied');
  assert.equal(p.storage.get(adsKey), 'denied');
  assert.deepEqual(expiredAdCookies(p), ['_gcl_au', '_gcl_aw']);
  assert.equal(wasExpired(p, '_gac_gb_123456'), true, 'GA4 ad click cookie');
  assert.equal(p.reloads(), 1);
});

test('GA4 _gac_ cookies are kept only while both analytics and advertising are granted', () => {
  for (const initial of [{ [key]: 'granted' }, { [key]: 'granted', [adsKey]: 'denied' }, { [key]: 'denied', [adsKey]: 'granted' }]) {
    const p = page(initial);
    assert.equal(wasExpired(p, '_gac_gb_123456'), true, JSON.stringify(initial));
    assert.equal(wasExpired(p, 'necessary'), false);
  }
});

test('without an advertising grant, every page load clears leftover ad cookies and the stored click', () => {
  for (const initial of [{}, { [key]: 'granted' }, { [key]: 'granted', [adsKey]: 'denied' }]) {
    const p = page({ ...initial, _gcl_ls: '{}' });
    assert.deepEqual(expiredAdCookies(p), ['_gcl_au', '_gcl_aw']);
    assert.equal(p.storage.has('_gcl_ls'), false);
  }
});

test('a page restored from the back/forward cache reloads after a withdrawal made on another page', () => {
  const p = page({ [key]: 'granted' });
  assert.equal(p.requests.length, 1);
  p.fire('pageshow', { persisted: true });
  assert.equal(p.reloads(), 0, 'nothing changed elsewhere');
  p.storage.set(key, 'denied'); p.storage.set(adsKey, 'denied');
  p.fire('pageshow', { persisted: false });
  assert.equal(p.reloads(), 0, 'a normal load already read storage');
  p.fire('pageshow', { persisted: true });
  assert.equal(p.reloads(), 1);
});

test('a restored page adopts a grant made elsewhere and loads one GTM instance', () => {
  const p = page();
  assert.ok(p.shows('aetheris-cookie-banner'));
  p.storage.set(key, 'granted');
  p.fire('pageshow', { persisted: true });
  assert.equal(p.requests.length, 1);
  const updates = p.requests[0].consent.filter(args => args[0] === 'consent' && args[1] === 'update');
  assert.equal(updates.at(-1)[2].analytics_storage, 'granted');
  assert.equal(updates.at(-1)[2].ad_storage, 'denied');
  assert.equal(p.shows('aetheris-cookie-banner'), false);
  assert.ok(p.shows('aetheris-cookie-preferences'));
  assert.deepEqual(p.announced.at(-1), { type: 'aetheris:consent', analytics: true, ads: false });
  p.fire('pageshow', { persisted: true }); p.fire('storage', { key });
  assert.equal(p.requests.length, 1);
  assert.equal(p.reloads(), 0);
});

test('a withdrawal in another tab reloads this tab; unrelated keys are ignored', () => {
  const p = page({ [key]: 'granted' });
  p.storage.set(key, 'denied');
  p.fire('storage', { key: 'unrelated' });
  assert.equal(p.reloads(), 0);
  p.fire('storage', { key });
  assert.equal(p.reloads(), 1);
});

test('a Reject made elsewhere replaces the banner without loading GTM', () => {
  const p = page();
  const clarityCleared = () => p.expired.filter(cookie => cookie.startsWith('_clck=')).length;
  const before = clarityCleared();
  p.storage.set(key, 'denied'); p.storage.set(adsKey, 'denied');
  p.fire('storage', { key: null });
  assert.equal(p.requests.length, 0);
  assert.equal(p.shows('aetheris-cookie-banner'), false);
  assert.ok(p.shows('aetheris-cookie-preferences'));
  assert.ok(clarityCleared() > before, 'analytics cookies are cleared again');
  assert.equal(lastConsentUpdate(p).analytics_storage, 'denied');
  assert.deepEqual(p.announced.at(-1), { type: 'aetheris:consent', analytics: false, ads: false });
  assert.equal(p.reloads(), 0);
});

test('an advertising withdrawal on a campaign page clears the kept ad click in an open tab', () => {
  const p = page({ [key]: 'denied', [adsKey]: 'granted', _gcl_ls: '{}' });
  assert.deepEqual(expiredAdCookies(p), []);
  p.storage.set(adsKey, 'denied');
  p.fire('storage', { key: adsKey });
  assert.deepEqual(expiredAdCookies(p), ['_gcl_au', '_gcl_aw']);
  assert.equal(p.storage.has('_gcl_ls'), false);
  assert.equal(p.requests.length, 0);
  assert.equal(p.reloads(), 0);
});

test('without readable storage, a restored page keeps the choice made on it', () => {
  const p = page(); p.choose('granted');
  p.window.localStorage.getItem = () => { throw new Error('SecurityError: storage is disabled'); };
  p.fire('pageshow', { persisted: true });
  p.fire('storage', { key });
  assert.equal(p.reloads(), 0);
  assert.equal(p.requests.length, 1);
  assert.ok(p.shows('aetheris-cookie-preferences'));
});
