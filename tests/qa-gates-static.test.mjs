import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
  assert.match(source, /--expect-preview-silent/);
  assert.match(source, /'accept-preview-zero-optional'/);
  assert.match(source, /sleep\(expectAnalytics \? settleMs : acceptTimeoutMs\)/);
  assert.match(source, /'accept-preview-zero-until-revoke'/);
  assert.match(source, /PUBLIC_PREVIEW_HOST_PATTERN\.test\(parsedUrl\.hostname\)/);
  assert.doesNotMatch(source, /clickButton\(/);
});

test("preview-silent consent QA rejects non-Pages targets before browser launch", () => {
  const result = spawnSync(
    process.execPath,
    [
      "qa/consent-network.mjs",
      "https://example.com/",
      "--expect-preview-silent"
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8"
    }
  );

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /restricted to HTTPS \*\.aetheris-studio\.pages\.dev preview hosts/
  );
  assert.doesNotMatch(result.stderr, /Chrome|Chromium/);
});
