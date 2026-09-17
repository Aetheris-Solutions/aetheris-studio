import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../webflow-site/assets/js/studio-motion.js', import.meta.url), 'utf8');
function setup({ reduced = false, observer = true } = {}) {
  let intersect, preferenceChange, focus;
  const animations = [];
  const element = {
    parentElement: null, visible: false,
    classList: { add() { element.visible = true; } },
    matches: () => false, querySelector: () => null,
    contains: target => target === element,
    animate() {
      const animation = { effect: { target: element }, cancelled: false,
        cancel() { this.cancelled = true; this.oncancel?.(); } };
      animations.push(animation); return animation;
    },
  };
  const preference = { matches: reduced, addEventListener(_, fn) { preferenceChange = fn; } };
  const io = { observed: false, disconnected: false,
    observe() { this.observed = true; }, unobserve() { this.observed = false; },
    disconnect() { this.disconnected = true; } };
  function IntersectionObserver(fn) { intersect = fn; return io; }
  vm.runInNewContext(source, {
    window: { matchMedia: () => preference, ...(observer ? { IntersectionObserver } : {}) },
    IntersectionObserver,
    document: { querySelectorAll: selector => selector.startsWith('h1') ? [element] : [],
      addEventListener(_, fn) { focus = fn; } },
  });
  return { element, animations, io,
    reveal() { intersect([{ target: element, isIntersecting: true }]); },
    reduce() { preference.matches = true; preferenceChange(); },
    focus() { focus({ target: element }); } };
}
test('reduced motion and browsers without observers keep content visible without entrance animations', () => {
  for (const options of [{ reduced: true }, { observer: false }]) {
    const page = setup(options);
    assert.equal(page.element.visible, true);
    assert.equal(page.animations.length, 0);
  }
});
test('switching to reduced motion cancels active reveals and stops observing', () => {
  const page = setup(); page.reveal(); page.reduce();
  assert.equal(page.animations[0].cancelled, true);
  assert.equal(page.io.disconnected, true);
  assert.equal(page.element.visible, true);
});
test('keyboard focus cancels the entrance on the focused control', () => {
  const page = setup(); page.reveal(); page.focus();
  assert.equal(page.animations[0].cancelled, true);
});
