import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("dynamic contrast covers both locales, complete hero copy and landscape", async () => {
  const source = await readFile("qa/dynamic-contrast.mjs", "utf8");

  assert.match(source, /\{\s*id:\s*'en',\s*path:\s*'\/'/);
  assert.match(source, /\{\s*id:\s*'it',\s*path:\s*'\/it\/'/);
  assert.match(source, /selector:\s*'\.locale-switch'/);
  assert.match(source, /selector:\s*'\.hero-fit'/);
  assert.match(source, /id:\s*'desktop-landscape'/);
  assert.match(source, /width:\s*1366,\s*height:\s*768/);
  assert.match(source, /for\s*\(const locale of LOCALES\)/);
});

test("consent network uses locale-independent controls and gates focus isolation", async () => {
  const source = await readFile("qa/consent-network.mjs", "utf8");

  assert.match(source, /\{\s*id:\s*'en',\s*path:\s*'\/'/);
  assert.match(source, /\{\s*id:\s*'it',\s*path:\s*'\/it\/'/);
  assert.match(source, /reject:\s*'\.consent-panel__actions \.consent-action--decision:first-of-type'/);
  assert.match(source, /accept:\s*'\.consent-panel__actions \.consent-action--decision:last-of-type'/);
  assert.match(source, /async function verifyFocusTrap/);
  assert.match(source, /document\.activeElement instanceof HTMLElement\) document\.activeElement\.blur\(\)/);
  assert.match(source, /'fresh-inert'/);
  assert.match(source, /'fresh-focus-trap'/);
  assert.match(source, /'preferences-restore-focus'/);
  assert.doesNotMatch(source, /clickButton\(/);
});
