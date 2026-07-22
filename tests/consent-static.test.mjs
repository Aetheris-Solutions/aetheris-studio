import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('production security policies allow only the consented analytics providers', async () => {
  const [headers, middleware] = await Promise.all([
    readFile('public/_headers', 'utf8'),
    readFile('functions/_middleware.js', 'utf8')
  ]);

  for (const policy of [headers, middleware]) {
    assert.match(policy, /https:\/\/www\.googletagmanager\.com/);
    assert.match(policy, /https:\/\/\*\.google-analytics\.com/);
    assert.match(policy, /https:\/\/\*\.clarity\.ms/);
    assert.match(policy, /https:\/\/c\.bing\.com/);
  }
});

test('GTM is initialised through the consent bootstrap rather than index markup', async () => {
  const [index, main, consent] = await Promise.all([
    readFile('index.html', 'utf8'),
    readFile('src/main.tsx', 'utf8'),
    readFile('src/lib/consent.ts', 'utf8')
  ]);

  assert.doesNotMatch(index, /googletagmanager\.com/);
  assert.match(main, /initialiseConsentManagement\(\)/);
  assert.match(consent, /GTM-5553RFJZ/);
  assert.match(consent, /analytics_storage: 'denied'/);
  assert.match(consent, /document\.head\.appendChild\(script\)/);
});
