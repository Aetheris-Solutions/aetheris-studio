#!/usr/bin/env node

/**
 * Browser-level consent and analytics network gate.
 *
 * The audit deliberately uses Chrome's DevTools Protocol directly so it has no
 * runtime dependency beyond Node and an installed Chrome/Chromium binary. It
 * verifies the real network boundary (not merely UI state): optional vendors
 * must remain unreachable before consent and after withdrawal.
 */

import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_JSON = path.join(SCRIPT_DIR, 'artifacts/consent-analytics-evidence.json');
const DEFAULT_REPORT = path.join(SCRIPT_DIR, 'artifacts/CONSENT-ANALYTICS-AUDIT.md');
const CONSENT_KEY = 'aetheris_consent_v1';
const ATTRIBUTION_KEY = 'aetheris_studio_attribution_v1';
const EXPECTED_GTM_ID = 'GTM-5553RFJZ';
const PII_SENTINEL = 'consent-qa-private';
const MOBILE_VIEWPORT = { width: 390, height: 844, mobile: true };
const LOCALES = [
  { id: 'en', path: '/', label: 'English' },
  { id: 'it', path: '/it/', label: 'Italian' }
];
const CONSENT_SELECTORS = {
  panel: '.consent-panel',
  close: '.consent-panel__close',
  reject: '.consent-panel__actions .consent-action--decision:first-of-type',
  secondary: '.consent-panel__actions .consent-action--secondary',
  accept: '.consent-panel__actions .consent-action--decision:last-of-type',
  footer: '.footer-consent-button',
  analytics: '.consent-preference input[type="checkbox"]'
};

function parseArgs(argv) {
  const result = {
    url: process.env.CONSENT_QA_URL || null,
    chrome: process.env.CHROME_BIN || null,
    output: DEFAULT_JSON,
    report: DEFAULT_REPORT,
    settleMs: Number(process.env.CONSENT_QA_SETTLE_MS || 3_500),
    acceptTimeoutMs: Number(process.env.CONSENT_QA_ACCEPT_TIMEOUT_MS || 30_000),
    keepProfile: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === '--url') result.url = argv[++index];
    else if (option === '--chrome') result.chrome = argv[++index];
    else if (option === '--output') result.output = path.resolve(argv[++index]);
    else if (option === '--report') result.report = path.resolve(argv[++index]);
    else if (option === '--settle-ms') result.settleMs = Number(argv[++index]);
    else if (option === '--accept-timeout-ms') result.acceptTimeoutMs = Number(argv[++index]);
    else if (option === '--keep-profile') result.keepProfile = true;
    else if (option === '--help' || option === '-h') result.help = true;
    else if (!option.startsWith('-') && !result.url) result.url = option;
    else throw new Error(`Unknown option: ${option}`);
  }

  if (!Number.isFinite(result.settleMs) || result.settleMs < 500) {
    throw new Error('--settle-ms must be at least 500.');
  }
  if (!Number.isFinite(result.acceptTimeoutMs) || result.acceptTimeoutMs < 2_000) {
    throw new Error('--accept-timeout-ms must be at least 2000.');
  }
  return result;
}

function usage() {
  return `Aetheris consent / analytics network audit

Usage:
  CONSENT_QA_URL=https://preview.example node qa/consent-network.mjs
  node qa/consent-network.mjs https://preview.example [options]

The supplied origin is audited independently at `/` and `/it/`.

Options:
  --url <url>                 Target preview URL (overrides CONSENT_QA_URL)
  --chrome <path>             Chrome/Chromium executable (or CHROME_BIN)
  --output <path>             JSON evidence destination
  --report <path>             Markdown report destination
  --settle-ms <number>        Quiet observation window (default: 3500)
  --accept-timeout-ms <n>     Time allowed for GA4 and Clarity (default: 30000)
  --keep-profile              Keep the temporary browser profile for diagnosis
  -h, --help                  Show this help
`;
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
        else pending.resolve(message.result ?? {});
        return;
      }
      for (const listener of this.listeners.get(message.method) ?? []) listener(message.params ?? {});
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? new Set();
    listeners.add(listener);
    this.listeners.set(method, listeners);
    return () => listeners.delete(listener);
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket?.close();
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function canAccess(candidate) {
  if (!candidate) return false;
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function findChrome(explicit) {
  const candidates = [
    explicit,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];
  for (const candidate of candidates) if (await canAccess(candidate)) return candidate;
  throw new Error('Chrome/Chromium not found. Pass --chrome or set CHROME_BIN.');
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForHttp(url, timeoutMs, label) {
  const started = Date.now();
  let latestError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      latestError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      latestError = error;
    }
    await sleep(80);
  }
  throw new Error(`${label} did not become ready: ${latestError?.message || 'timeout'}`);
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  const exited = await Promise.race([
    new Promise((resolve) => child.once('exit', () => resolve(true))),
    sleep(2_000).then(() => false)
  ]);
  if (!exited && child.exitCode === null) child.kill('SIGKILL');
}

async function launchChrome(chromePath, port, userDataDir) {
  const child = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-features=Translate,MediaRouter',
    '--disable-sync',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    '--window-size=390,844',
    'about:blank'
  ], { stdio: 'ignore' });
  child.once('error', () => {});
  await waitForHttp(`http://127.0.0.1:${port}/json/version`, 15_000, 'Chrome CDP');
  return child;
}

function classifyService(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  const pathname = url.pathname.toLowerCase();

  if (host === 'www.googletagmanager.com' && pathname === '/gtm.js') return 'gtm';
  if (
    host === 'www.google-analytics.com'
    || host.endsWith('.google-analytics.com')
    || (host === 'www.googletagmanager.com' && (pathname === '/gtag/js' || pathname === '/g/collect'))
  ) return 'ga4';
  if (
    host === 'www.clarity.ms'
    || host.endsWith('.clarity.ms')
    || host === 'c.bing.com'
    || host === 'bat.bing.com'
  ) return 'clarity';
  return null;
}

function sanitiseUrl(value) {
  try {
    const url = new URL(value);
    const parameterNames = [...new Set(url.searchParams.keys())].sort();
    url.search = parameterNames.length ? `?params=${encodeURIComponent(parameterNames.join(','))}` : '';
    url.hash = '';
    return url.toString();
  } catch {
    return '[invalid URL]';
  }
}

function createTelemetry(client) {
  const requests = [];
  const failures = [];
  const cspBlocks = [];

  client.on('Network.requestWillBeSent', (event) => {
    const service = classifyService(event.request?.url);
    if (!service) return;
    let containerId = null;
    if (service === 'gtm') {
      try {
        containerId = new URL(event.request.url).searchParams.get('id');
      } catch {
        // Retain null; the corresponding assertion will fail without leaking data.
      }
    }
    const requestMaterial = [
      event.request?.url || '',
      event.request?.postData || '',
      ...Object.values(event.request?.headers || {}).map(String)
    ].join('\n').toLowerCase();
    requests.push({
      requestId: event.requestId,
      service,
      url: sanitiseUrl(event.request.url),
      ...(service === 'gtm' ? { containerId } : {}),
      method: event.request.method,
      resourceType: event.type,
      status: null,
      fromDiskCache: false,
      containsPiiSentinel: requestMaterial.includes(PII_SENTINEL),
      timestamp: Date.now()
    });
  });

  client.on('Network.responseReceived', (event) => {
    const request = requests.findLast((candidate) => candidate.requestId === event.requestId);
    if (!request) return;
    request.status = event.response?.status ?? null;
    request.fromDiskCache = Boolean(event.response?.fromDiskCache || event.response?.fromPrefetchCache);
  });

  client.on('Network.loadingFailed', (event) => {
    const request = requests.findLast((candidate) => candidate.requestId === event.requestId);
    const entry = {
      requestId: event.requestId,
      service: request?.service ?? null,
      url: request?.url ?? null,
      errorText: event.errorText || 'Network loading failed',
      blockedReason: event.blockedReason || null,
      timestamp: Date.now()
    };
    failures.push(entry);
    if (event.blockedReason === 'csp') cspBlocks.push({ source: 'network', ...entry });
  });

  const recordCspText = (source, text) => {
    if (!/content security policy|refused to (?:load|connect|execute)|violates the following content security/i.test(text)) return;
    cspBlocks.push({ source, text: String(text).slice(0, 1_500), timestamp: Date.now() });
  };
  client.on('Log.entryAdded', ({ entry }) => recordCspText('browser-log', entry?.text || ''));
  client.on('Runtime.consoleAPICalled', (event) => {
    const text = (event.args ?? []).map((argument) => argument.value ?? argument.description ?? '').join(' ');
    recordCspText('console', text);
  });
  client.on('Runtime.exceptionThrown', (event) => {
    const text = event.exceptionDetails?.exception?.description || event.exceptionDetails?.text || '';
    recordCspText('runtime', text);
  });

  return {
    requests,
    failures,
    cspBlocks,
    mark() {
      return { requests: requests.length, failures: failures.length, cspBlocks: cspBlocks.length };
    }
  };
}

async function configureViewport(client, viewport = MOBILE_VIEWPORT) {
  await client.send('Emulation.setEmulatedMedia', {
    media: '',
    features: [
      { name: 'prefers-reduced-motion', value: 'reduce' },
      { name: 'prefers-color-scheme', value: 'dark' }
    ]
  });
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
    screenOrientation: { type: 'portraitPrimary', angle: 0 }
  });
}

async function createPage(cdpPort) {
  const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?about%3Ablank`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Chrome could not create a page: ${response.status} ${response.statusText}`);
  const target = await response.json();
  if (!target.webSocketDebuggerUrl) throw new Error('Chrome page has no CDP WebSocket URL.');
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  const telemetry = createTelemetry(client);
  await Promise.all([
    client.send('Page.enable'),
    client.send('Runtime.enable'),
    client.send('Network.enable'),
    client.send('Log.enable')
  ]);
  await configureViewport(client);
  return { client, telemetry };
}

async function closePage(page) {
  if (!page) return;
  await page.client.send('Page.close').catch(() => {});
  page.client.close();
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (response.exceptionDetails) {
    const detail = response.exceptionDetails.exception?.description || response.exceptionDetails.text;
    throw new Error(detail || 'Runtime.evaluate failed');
  }
  return response.result?.value;
}

async function waitFor(predicate, timeoutMs, intervalMs = 80) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      if (await predicate()) return true;
    } catch {
      // Navigation replaces the JavaScript realm; retry until it settles.
    }
    await sleep(intervalMs);
  }
  return false;
}

async function waitForExpression(client, expression, timeoutMs = 20_000) {
  return waitFor(() => evaluate(client, `Boolean(${expression})`), timeoutMs);
}

async function navigate(client, url) {
  const result = await client.send('Page.navigate', { url });
  if (result.errorText) throw new Error(`Navigation failed: ${result.errorText}`);
  const ready = await waitForExpression(client, `document.readyState === 'complete'`, 25_000);
  if (!ready) throw new Error(`Timed out loading ${url}`);
}

async function clearSiteData(client, targetUrl) {
  const origin = new URL(targetUrl).origin;
  await Promise.all([
    client.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }),
    client.send('Network.clearBrowserCookies'),
    client.send('Network.clearBrowserCache')
  ]);
}

function requestsSince(telemetry, mark) {
  return telemetry.requests.slice(mark.requests);
}

function cspSince(telemetry, mark) {
  return telemetry.cspBlocks.slice(mark.cspBlocks);
}

function phaseEvidence(telemetry, mark) {
  const requests = requestsSince(telemetry, mark);
  const byService = (service) => requests.filter((request) => request.service === service);
  return {
    optionalRequestCount: requests.length,
    gtmRequestCount: byService('gtm').length,
    ga4RequestCount: byService('ga4').length,
    clarityRequestCount: byService('clarity').length,
    piiSentinelLeakCount: requests.filter((request) => request.containsPiiSentinel).length,
    cspBlockCount: cspSince(telemetry, mark).length,
    requests: requests.map(({ requestId: _requestId, timestamp: _timestamp, ...request }) => request),
    cspBlocks: cspSince(telemetry, mark).map(({ timestamp: _timestamp, ...block }) => block)
  };
}

function successfulRequest(request) {
  return Number.isFinite(request.status) && request.status >= 200 && request.status < 400;
}

async function readConsentState(client) {
  return evaluate(client, `(() => {
    let consent = null;
    try { consent = JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_KEY)}) || 'null'); } catch {}
    const cookies = document.cookie.split(';').map((part) => part.trim().split('=')[0]).filter(Boolean);
    return {
      consent,
      attributionPresent: localStorage.getItem(${JSON.stringify(ATTRIBUTION_KEY)}) !== null,
      cookieNames: cookies.sort(),
      panelVisible: Boolean(document.querySelector('.consent-panel')),
      preferencesVisible: Boolean(document.querySelector('.consent-panel--expanded'))
    };
  })()`);
}

async function clickSelector(client, selector) {
  const clicked = await evaluate(client, `(() => {
    const control = document.querySelector(${JSON.stringify(selector)});
    if (!control) return false;
    control.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Control not found: ${selector}`);
  return clicked;
}

async function dispatchKey(client, key, { shift = false } = {}) {
  const keyCode = key === 'Tab' ? 9 : key === 'Escape' ? 27 : 0;
  const parameters = {
    key,
    code: key,
    modifiers: shift ? 8 : 0,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode
  };
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...parameters });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...parameters });
  await sleep(80);
}

async function inspectDialogIsolation(client) {
  return evaluate(client, `(() => {
    const panel = document.querySelector(${JSON.stringify(CONSENT_SELECTORS.panel)});
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const focusables = panel
      ? [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
          .filter((element) => visible(element) && element.tabIndex >= 0)
      : [];
    const outside = [...document.querySelectorAll('.site-header, main')];
    return {
      panelVisible: Boolean(panel && visible(panel)),
      activeInside: Boolean(panel?.contains(document.activeElement)),
      activeIndex: focusables.indexOf(document.activeElement),
      focusableCount: focusables.length,
      outsideInert: outside.length >= 2 && outside.every((element) => element.inert === true),
      outsideStates: outside.map((element) => ({
        selector: element.matches('.site-header') ? '.site-header' : 'main',
        inert: element.inert
      }))
    };
  })()`);
}

async function verifyFocusTrap(client) {
  const setupForward = await evaluate(client, `(() => {
    const panel = document.querySelector(${JSON.stringify(CONSENT_SELECTORS.panel)});
    if (!panel) return false;
    const focusables = [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0 && element.tabIndex >= 0;
      });
    focusables.at(-1)?.focus();
    return focusables.length > 1 && document.activeElement === focusables.at(-1);
  })()`);
  await dispatchKey(client, 'Tab');
  const forward = await inspectDialogIsolation(client);

  const setupBackward = await evaluate(client, `(() => {
    const panel = document.querySelector(${JSON.stringify(CONSENT_SELECTORS.panel)});
    if (!panel) return false;
    const focusables = [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0 && element.tabIndex >= 0;
      });
    focusables[0]?.focus();
    return focusables.length > 1 && document.activeElement === focusables[0];
  })()`);
  await dispatchKey(client, 'Tab', { shift: true });
  const backward = await inspectDialogIsolation(client);

  return {
    setupForward,
    setupBackward,
    forwardWrapped: forward.activeInside && forward.activeIndex === 0,
    backwardWrapped: backward.activeInside && backward.activeIndex === backward.focusableCount - 1,
    forward,
    backward
  };
}

async function inspectMobileBanner(client) {
  return evaluate(client, `(() => {
    const panel = document.querySelector(${JSON.stringify(CONSENT_SELECTORS.panel)});
    const decisions = [...document.querySelectorAll('.consent-panel__actions .consent-action--decision')];
    const reject = decisions[0];
    const accept = decisions.at(-1);
    const styleKeys = [
      'backgroundColor', 'color', 'borderTopColor', 'borderTopStyle', 'borderTopWidth',
      'boxShadow', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'minHeight'
    ];
    const fingerprint = (element) => {
      if (!element) return null;
      const style = getComputedStyle(element);
      return Object.fromEntries(styleKeys.map((key) => [key, style[key]]));
    };
    const rejectStyle = fingerprint(reject);
    const acceptStyle = fingerprint(accept);
    const rejectRect = reject?.getBoundingClientRect();
    const acceptRect = accept?.getBoundingClientRect();
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const accessibleName = (element) => {
      const labelledBy = element.getAttribute('aria-labelledby');
      const labelledText = labelledBy
        ? labelledBy.split(/\\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ')
        : '';
      const labelText = 'labels' in element && element.labels
        ? [...element.labels].map((label) => label.textContent || '').join(' ')
        : '';
      return (
        element.getAttribute('aria-label') || labelledText || labelText
        || element.textContent || element.getAttribute('title') || ''
      ).replace(/\\s+/g, ' ').trim();
    };
    const focusables = panel
      ? [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
          .filter((element) => visible(element) && element.tabIndex >= 0)
          .map((element) => {
            element.focus();
            return {
              tag: element.tagName.toLowerCase(),
              name: accessibleName(element),
              receivesFocus: document.activeElement === element
            };
          })
      : [];
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth,
      panelVisible: Boolean(panel),
      acceptRejectStyleEqual: JSON.stringify(rejectStyle) === JSON.stringify(acceptStyle),
      acceptRejectDimensionsEqual: Boolean(rejectRect && acceptRect)
        && Math.abs(rejectRect.width - acceptRect.width) < 0.5
        && Math.abs(rejectRect.height - acceptRect.height) < 0.5,
      rejectStyle,
      acceptStyle,
      focusables,
      unnamedFocusableCount: focusables.filter((entry) => !entry.name).length,
      unfocusableCount: focusables.filter((entry) => !entry.receivesFocus).length
    };
  })()`);
}

function addCheck(evidence, id, label, pass, expected, actual) {
  const entry = {
    id: evidence.locale ? `${evidence.locale}-${id}` : id,
    locale: evidence.locale ?? null,
    label,
    pass: Boolean(pass),
    expected,
    actual
  };
  evidence.checks.push(entry);
  process.stderr.write(`[consent${evidence.locale ? `:${evidence.locale}` : ''}] ${entry.pass ? 'PASS' : 'FAIL'} ${label}\n`);
  return entry.pass;
}

function serviceCount(phase, service) {
  return phase.requests.filter((request) => request.service === service).length;
}

function successfulServiceCount(phase, service) {
  return phase.requests.filter((request) => request.service === service && successfulRequest(request)).length;
}

async function runAudit({ url, chrome, cdpPort, profileDir, settleMs, acceptTimeoutMs, evidence }) {
  const sensitiveUrl = new URL(url);
  sensitiveUrl.searchParams.set('utm_source', 'consent-qa');
  sensitiveUrl.searchParams.set('email', `${PII_SENTINEL}@example.invalid`);
  sensitiveUrl.hash = PII_SENTINEL;
  const auditUrl = sensitiveUrl.toString();
  let browser;
  let page;
  try {
    browser = await launchChrome(chrome, cdpPort, profileDir);

    // Fresh visit and close-as-reject, using the exact mobile launch viewport.
    page = await createPage(cdpPort);
    await clearSiteData(page.client, auditUrl);
    const freshMark = page.telemetry.mark();
    await navigate(page.client, auditUrl);
    const freshPanelReady = await waitForExpression(page.client, `document.querySelector('.consent-panel')`, 20_000);
    await sleep(settleMs);
    const freshIsolation = await inspectDialogIsolation(page.client);
    const freshFocusTrap = await verifyFocusTrap(page.client);
    evidence.mobile = await inspectMobileBanner(page.client);
    evidence.states.freshIsolation = freshIsolation;
    evidence.states.freshFocusTrap = freshFocusTrap;
    evidence.phases.fresh = phaseEvidence(page.telemetry, freshMark);
    addCheck(evidence, 'fresh-banner', 'Fresh visit shows the consent controls', freshPanelReady && evidence.mobile.panelVisible, true, evidence.mobile.panelVisible);
    addCheck(evidence, 'fresh-zero-optional', 'Fresh visit sends no Google or Clarity request', evidence.phases.fresh.optionalRequestCount === 0, 0, evidence.phases.fresh.optionalRequestCount);
    addCheck(evidence, 'mobile-viewport', 'Mobile audit runs at 390×844', evidence.mobile.viewport.width === 390 && evidence.mobile.viewport.height === 844, { width: 390, height: 844 }, evidence.mobile.viewport);
    addCheck(evidence, 'mobile-overflow', 'Consent UI has no horizontal overflow', !evidence.mobile.horizontalOverflow, false, evidence.mobile.horizontalOverflow);
    addCheck(evidence, 'mobile-equal-decisions', 'Accept and reject have equal visual prominence', evidence.mobile.acceptRejectStyleEqual && evidence.mobile.acceptRejectDimensionsEqual, true, {
      styleEqual: evidence.mobile.acceptRejectStyleEqual,
      dimensionsEqual: evidence.mobile.acceptRejectDimensionsEqual
    });
    addCheck(evidence, 'mobile-accessible-names', 'Every visible consent control is named and receives focus', evidence.mobile.focusables.length >= 5 && evidence.mobile.unnamedFocusableCount === 0 && evidence.mobile.unfocusableCount === 0, { minimumControls: 5, unnamed: 0, unfocusable: 0 }, {
      controls: evidence.mobile.focusables.length,
      unnamed: evidence.mobile.unnamedFocusableCount,
      unfocusable: evidence.mobile.unfocusableCount,
      names: evidence.mobile.focusables.map((entry) => entry.name)
    });
    addCheck(evidence, 'fresh-initial-focus', 'Fresh dialog receives initial focus', freshIsolation.panelVisible && freshIsolation.activeInside, true, {
      panelVisible: freshIsolation.panelVisible,
      activeInside: freshIsolation.activeInside,
      activeIndex: freshIsolation.activeIndex
    });
    addCheck(evidence, 'fresh-inert', 'Header and main content are inert while the dialog is open', freshIsolation.outsideInert, true, freshIsolation.outsideStates);
    addCheck(
      evidence,
      'fresh-focus-trap',
      'Tab and Shift+Tab wrap inside the consent dialog',
      freshFocusTrap.setupForward && freshFocusTrap.setupBackward
        && freshFocusTrap.forwardWrapped && freshFocusTrap.backwardWrapped,
      { forwardWrapped: true, backwardWrapped: true },
      {
        setupForward: freshFocusTrap.setupForward,
        setupBackward: freshFocusTrap.setupBackward,
        forwardWrapped: freshFocusTrap.forwardWrapped,
        backwardWrapped: freshFocusTrap.backwardWrapped
      }
    );

    const closeMark = page.telemetry.mark();
    const closed = await clickSelector(page.client, CONSENT_SELECTORS.close);
    const closeStored = await waitForExpression(page.client, `JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_KEY)}) || 'null')?.analytics === false`, 5_000);
    const closeReleasedInert = await waitForExpression(
      page.client,
      `![...document.querySelectorAll('.site-header, main')].some((element) => element.inert)`,
      5_000
    );
    await sleep(500);
    evidence.phases.close = phaseEvidence(page.telemetry, closeMark);
    addCheck(evidence, 'close-denies', 'Close control persists rejection', closed && closeStored, true, { clicked: closed, denialStored: closeStored });
    addCheck(evidence, 'close-releases-inert', 'Closing the dialog restores background interactivity', closeReleasedInert, true, closeReleasedInert);
    addCheck(evidence, 'close-zero-optional', 'Close action sends no Google or Clarity request', evidence.phases.close.optionalRequestCount === 0, 0, evidence.phases.close.optionalRequestCount);
    const closeReloadMark = page.telemetry.mark();
    await navigate(page.client, auditUrl);
    await sleep(settleMs);
    evidence.phases.closeReload = phaseEvidence(page.telemetry, closeReloadMark);
    const closeReloadState = await readConsentState(page.client);
    evidence.states.afterCloseReload = closeReloadState;
    addCheck(evidence, 'close-reload-zero-optional', 'Closed/rejected choice remains network-silent across reload', evidence.phases.closeReload.optionalRequestCount === 0 && closeReloadState.consent?.analytics === false, { requests: 0, analytics: false }, { requests: evidence.phases.closeReload.optionalRequestCount, analytics: closeReloadState.consent?.analytics });
    await closePage(page);
    page = null;

    // Explicit rejection and a second reload are isolated from the close path.
    page = await createPage(cdpPort);
    await clearSiteData(page.client, auditUrl);
    const rejectFreshMark = page.telemetry.mark();
    await navigate(page.client, auditUrl);
    await waitForExpression(page.client, `document.querySelector('.consent-panel')`, 20_000);
    await sleep(settleMs);
    evidence.phases.rejectFresh = phaseEvidence(page.telemetry, rejectFreshMark);
    const rejectMark = page.telemetry.mark();
    await clickSelector(page.client, CONSENT_SELECTORS.reject);
    const rejected = await waitForExpression(page.client, `JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_KEY)}) || 'null')?.analytics === false`, 5_000);
    await sleep(500);
    evidence.phases.reject = phaseEvidence(page.telemetry, rejectMark);
    addCheck(evidence, 'reject-zero-optional', 'Explicit rejection sends no Google or Clarity request', rejected && evidence.phases.rejectFresh.optionalRequestCount === 0 && evidence.phases.reject.optionalRequestCount === 0, 0, evidence.phases.rejectFresh.optionalRequestCount + evidence.phases.reject.optionalRequestCount);
    const rejectReloadMark = page.telemetry.mark();
    await navigate(page.client, auditUrl);
    await sleep(settleMs);
    evidence.phases.rejectReload = phaseEvidence(page.telemetry, rejectReloadMark);
    const rejectReloadState = await readConsentState(page.client);
    evidence.states.afterRejectReload = rejectReloadState;
    addCheck(evidence, 'reject-reload-zero-optional', 'Explicit rejection remains network-silent across reload', evidence.phases.rejectReload.optionalRequestCount === 0 && rejectReloadState.consent?.analytics === false && !rejectReloadState.panelVisible, { requests: 0, analytics: false, panelVisible: false }, { requests: evidence.phases.rejectReload.optionalRequestCount, analytics: rejectReloadState.consent?.analytics, panelVisible: rejectReloadState.panelVisible });
    await closePage(page);
    page = null;

    // Consent grant must load one GTM container and reach both configured tools.
    page = await createPage(cdpPort);
    await clearSiteData(page.client, auditUrl);
    const acceptFreshMark = page.telemetry.mark();
    await navigate(page.client, auditUrl);
    await waitForExpression(page.client, `document.querySelector('.consent-panel')`, 20_000);
    await sleep(settleMs);
    evidence.phases.acceptFresh = phaseEvidence(page.telemetry, acceptFreshMark);
    const acceptMark = page.telemetry.mark();
    await clickSelector(page.client, CONSENT_SELECTORS.accept);
    await waitFor(() => {
      const phase = phaseEvidence(page.telemetry, acceptMark);
      return serviceCount(phase, 'gtm') >= 1 && serviceCount(phase, 'ga4') >= 1 && serviceCount(phase, 'clarity') >= 1;
    }, acceptTimeoutMs, 120);
    await sleep(settleMs);
    evidence.phases.accept = phaseEvidence(page.telemetry, acceptMark);
    const acceptedState = await readConsentState(page.client);
    const acceptedRuntime = await evaluate(page.client, `(() => {
      const ordered = (window.dataLayer || []).map((entry, index) => {
        const values = typeof entry?.length === 'number' ? Array.from(entry) : [];
        if (values[0] === 'consent') return { index, kind: values[1], payload: values[2] };
        if (entry?.event === 'gtm.js') return { index, kind: 'gtm.js' };
        return null;
      }).filter(Boolean);
      return {
        ordered,
        search: location.search,
        hash: location.hash,
        attributionPresent: localStorage.getItem(${JSON.stringify(ATTRIBUTION_KEY)}) !== null
      };
    })()`);
    evidence.states.afterAccept = acceptedState;
    evidence.states.acceptedRuntime = acceptedRuntime;
    addCheck(evidence, 'accept-prechoice-zero', 'Accept scenario remains silent until the affirmative action', evidence.phases.acceptFresh.optionalRequestCount === 0, 0, evidence.phases.acceptFresh.optionalRequestCount);
    const gtmRequests = evidence.phases.accept.requests.filter((request) => request.service === 'gtm');
    addCheck(evidence, 'accept-one-gtm', 'Acceptance requests the expected GTM container exactly once', gtmRequests.length === 1 && successfulServiceCount(evidence.phases.accept, 'gtm') === 1 && gtmRequests[0]?.containerId === EXPECTED_GTM_ID, { requests: 1, successful: 1, container: EXPECTED_GTM_ID }, {
      requests: serviceCount(evidence.phases.accept, 'gtm'),
      successful: successfulServiceCount(evidence.phases.accept, 'gtm'),
      containers: gtmRequests.map((request) => request.containerId),
      urls: gtmRequests.map((request) => request.url)
    });
    addCheck(evidence, 'accept-ga4', 'Acceptance reaches GA4 successfully', successfulServiceCount(evidence.phases.accept, 'ga4') >= 1, '>= 1 successful request', successfulServiceCount(evidence.phases.accept, 'ga4'));
    addCheck(evidence, 'accept-clarity', 'Acceptance reaches Microsoft Clarity successfully', successfulServiceCount(evidence.phases.accept, 'clarity') >= 1, '>= 1 successful request', successfulServiceCount(evidence.phases.accept, 'clarity'));
    addCheck(evidence, 'accept-state', 'Acceptance persists analytics consent and keeps marketing denied', acceptedState.consent?.analytics === true && acceptedState.consent?.marketing === false, { analytics: true, marketing: false }, acceptedState.consent ? { analytics: acceptedState.consent.analytics, marketing: acceptedState.consent.marketing } : null);
    const defaultIndex = acceptedRuntime.ordered.find((entry) => entry.kind === 'default')?.index ?? -1;
    const updateIndex = acceptedRuntime.ordered.find((entry) => entry.kind === 'update' && entry.payload?.analytics_storage === 'granted')?.index ?? -1;
    const gtmIndex = acceptedRuntime.ordered.find((entry) => entry.kind === 'gtm.js')?.index ?? -1;
    addCheck(evidence, 'accept-order', 'Denied default precedes analytics grant, which precedes GTM', defaultIndex >= 0 && updateIndex > defaultIndex && gtmIndex > updateIndex, 'default < granted update < gtm.js', { defaultIndex, updateIndex, gtmIndex });
    addCheck(evidence, 'accept-url-scrub', 'Arbitrary query values and fragments are removed before vendor load', acceptedRuntime.search === '' && acceptedRuntime.hash === '', { search: '', hash: '' }, { search: acceptedRuntime.search, hash: acceptedRuntime.hash });
    addCheck(evidence, 'accept-attribution-preserved', 'Recognised acquisition context is preserved only after analytics consent', acceptedRuntime.attributionPresent, true, acceptedRuntime.attributionPresent);
    addCheck(evidence, 'accept-no-pii-sentinel', 'No GTM, GA4 or Clarity request contains the synthetic PII sentinel', evidence.phases.accept.piiSentinelLeakCount === 0, 0, evidence.phases.accept.piiSentinelLeakCount);
    addCheck(evidence, 'analytics-csp', 'GTM, GA4 and Clarity run without CSP violations', evidence.phases.accept.cspBlockCount === 0, 0, evidence.phases.accept.cspBlocks);

    // Seed origin-readable analytics artefacts so withdrawal cleanup is a
    // deterministic assertion even when third-party cookie policy suppresses a
    // vendor's own first-party cookie in headless Chrome.
    const seeded = await evaluate(page.client, `(() => {
      document.cookie = '_ga=CONSENT_QA; Path=/; SameSite=Lax';
      document.cookie = '_clck=CONSENT_QA; Path=/; SameSite=Lax';
      document.cookie = '_clsk=CONSENT_QA; Path=/; SameSite=Lax';
      localStorage.setItem(${JSON.stringify(ATTRIBUTION_KEY)}, JSON.stringify({ qa: true }));
      return {
        cookieNames: document.cookie.split(';').map((part) => part.trim().split('=')[0]).filter(Boolean),
        attributionPresent: localStorage.getItem(${JSON.stringify(ATTRIBUTION_KEY)}) !== null
      };
    })()`);
    evidence.states.seededBeforeRevoke = seeded;
    addCheck(evidence, 'revoke-fixture', 'Synthetic origin-readable analytics artefacts are established before withdrawal', seeded.attributionPresent && ['_ga', '_clck', '_clsk'].every((name) => seeded.cookieNames.includes(name)), { attributionPresent: true, cookieNames: ['_ga', '_clck', '_clsk'] }, seeded);
    const footerOpenedForRestore = await evaluate(page.client, `(() => {
      const button = document.querySelector(${JSON.stringify(CONSENT_SELECTORS.footer)});
      if (!button) return false;
      button.focus();
      button.click();
      return true;
    })()`);
    const preferencesOpenForRestore = await waitForExpression(page.client, `document.querySelector('.consent-panel--expanded')`, 5_000);
    const preferencesIsolation = await inspectDialogIsolation(page.client);
    await dispatchKey(page.client, 'Escape');
    const focusRestored = await waitForExpression(
      page.client,
      `!document.querySelector(${JSON.stringify(CONSENT_SELECTORS.panel)})
        && document.activeElement === document.querySelector(${JSON.stringify(CONSENT_SELECTORS.footer)})
        && ![...document.querySelectorAll('.site-header, main')].some((element) => element.inert)`,
      5_000
    );
    addCheck(evidence, 'footer-reopen', 'Footer Cookie choices reopens granular preferences', footerOpenedForRestore && preferencesOpenForRestore, true, {
      footerOpened: footerOpenedForRestore,
      preferencesOpen: preferencesOpenForRestore
    });
    addCheck(evidence, 'preferences-inert', 'Reopened preferences keep header and main inert', preferencesIsolation.outsideInert, true, preferencesIsolation.outsideStates);
    addCheck(evidence, 'preferences-restore-focus', 'Escape closes saved preferences and restores focus to the invoker', focusRestored, true, focusRestored);

    const footerOpenedForRevoke = await evaluate(page.client, `(() => {
      const button = document.querySelector(${JSON.stringify(CONSENT_SELECTORS.footer)});
      if (!button) return false;
      button.focus();
      button.click();
      return true;
    })()`);
    const preferencesOpenForRevoke = await waitForExpression(page.client, `document.querySelector('.consent-panel--expanded')`, 5_000);
    addCheck(evidence, 'footer-reopen-for-revoke', 'Preferences can reopen after focus restoration', footerOpenedForRevoke && preferencesOpenForRevoke, true, {
      footerOpened: footerOpenedForRevoke,
      preferencesOpen: preferencesOpenForRevoke
    });

    const revokeMark = page.telemetry.mark();
    const checkboxToggled = await evaluate(page.client, `(() => {
      const checkbox = document.querySelector(${JSON.stringify(CONSENT_SELECTORS.analytics)});
      if (!checkbox) return false;
      if (checkbox.checked) checkbox.click();
      return !checkbox.checked;
    })()`);
    // React commits the controlled checkbox state after the click handler. Save
    // in a separate task so the handler cannot capture the previous choice.
    const checkboxCommitted = await waitForExpression(
      page.client,
      `document.querySelector(${JSON.stringify(CONSENT_SELECTORS.analytics)})?.checked === false`,
      2_000
    );
    await sleep(100);
    const revokeStarted = checkboxToggled && checkboxCommitted
      ? await clickSelector(page.client, CONSENT_SELECTORS.secondary)
      : false;
    const revoked = await waitFor(async () => {
      const state = await readConsentState(page.client);
      return state.consent?.analytics === false && !state.attributionPresent;
    }, 10_000, 100);
    await sleep(750);
    evidence.phases.revoke = phaseEvidence(page.telemetry, revokeMark);
    let revokedState = null;
    const revokedStateReadable = await waitFor(async () => {
      const ready = await evaluate(page.client, `document.readyState === 'complete'`);
      if (!ready) return false;
      revokedState = await readConsentState(page.client);
      return true;
    }, 15_000, 100);
    if (!revokedStateReadable || !revokedState) throw new Error('Revoked state was not readable after the teardown reload.');
    evidence.states.afterRevoke = revokedState;
    const analyticsCookiePattern = /^(?:_ga(?:$|_)|_gid$|_gat(?:$|_)|_gac_|AMP_TOKEN$|_clck$|_clsk$)/;
    const residualAnalyticsCookies = revokedState.cookieNames.filter((name) => analyticsCookiePattern.test(name));
    addCheck(evidence, 'revoke-storage', 'Withdrawal clears accessible analytics cookies and stored attribution', revokeStarted && revoked && !revokedState.attributionPresent && residualAnalyticsCookies.length === 0, { attributionPresent: false, analyticsCookies: [] }, { checkboxToggled, checkboxCommitted, revokeStarted, revoked, attributionPresent: revokedState.attributionPresent, analyticsCookies: residualAnalyticsCookies });
    await closePage(page);
    page = null;

    // A new page is the cleanest proof that a previously loaded runtime cannot
    // survive withdrawal. Do not clear storage: the saved denial must govern it.
    page = await createPage(cdpPort);
    const deniedReloadMark = page.telemetry.mark();
    await navigate(page.client, auditUrl);
    await sleep(settleMs);
    evidence.phases.deniedCleanReload = phaseEvidence(page.telemetry, deniedReloadMark);
    const deniedReloadState = await readConsentState(page.client);
    evidence.states.afterDeniedCleanReload = deniedReloadState;
    addCheck(evidence, 'revoke-clean-reload', 'Clean reload after withdrawal sends zero optional requests', evidence.phases.deniedCleanReload.optionalRequestCount === 0 && deniedReloadState.consent?.analytics === false && !deniedReloadState.panelVisible, { requests: 0, analytics: false, panelVisible: false }, { requests: evidence.phases.deniedCleanReload.optionalRequestCount, analytics: deniedReloadState.consent?.analytics, panelVisible: deniedReloadState.panelVisible });
    addCheck(evidence, 'revoke-clean-csp', 'Clean denied reload has no CSP violation', evidence.phases.deniedCleanReload.cspBlockCount === 0, 0, evidence.phases.deniedCleanReload.cspBlocks);
  } finally {
    await closePage(page).catch(() => {});
    await stopProcess(browser);
  }
}

function markdownCell(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return String(text ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function reportFor(evidence) {
  const lines = [
    '# Aetheris consent, GTM and analytics — browser network audit',
    '',
    `Generated: ${evidence.capturedAt}`,
    '',
    `Targets: ${evidence.locales.map((locale) => `\`${locale.id}: ${locale.target}\``).join(' · ')}`,
    '',
    `**Verdict: ${evidence.summary.pass ? 'PASS' : 'FAIL'} — ${evidence.summary.failureCount} failure(s).**`,
    '',
    '## Gate results',
    '',
    '| Locale | Check | Expected | Actual | Result |',
    '|---|---|---|---|---|'
  ];
  for (const check of evidence.checks) {
    lines.push(`| ${check.locale?.toUpperCase() ?? '—'} | ${markdownCell(check.label)} | ${markdownCell(check.expected)} | ${markdownCell(check.actual)} | ${check.pass ? 'PASS' : 'FAIL'} |`);
  }

  lines.push('', '## Network phases', '', '| Locale | Phase | Optional | GTM | GA4 | Clarity | PII sentinel leaks | CSP blocks |', '|---|---|---:|---:|---:|---:|---:|---:|');
  for (const locale of evidence.locales) {
    for (const [name, phase] of Object.entries(locale.phases)) {
      lines.push(`| ${locale.id.toUpperCase()} | ${name} | ${phase.optionalRequestCount} | ${phase.gtmRequestCount} | ${phase.ga4RequestCount} | ${phase.clarityRequestCount} | ${phase.piiSentinelLeakCount} | ${phase.cspBlockCount} |`);
    }
  }

  lines.push('', '## Mobile accessibility evidence', '');
  for (const locale of evidence.locales) {
    lines.push(
      `### ${locale.label}`,
      '',
      `- Viewport: ${locale.mobile?.viewport?.width ?? '—'}×${locale.mobile?.viewport?.height ?? '—'}.`,
      `- Horizontal overflow: ${locale.mobile?.horizontalOverflow ? 'yes' : 'no'}.`,
      `- Accept/reject computed style equal: ${locale.mobile?.acceptRejectStyleEqual ? 'yes' : 'no'}.`,
      `- Accept/reject dimensions equal: ${locale.mobile?.acceptRejectDimensionsEqual ? 'yes' : 'no'}.`,
      `- Named focusable controls: ${locale.mobile?.focusables?.length ?? 0}; unnamed: ${locale.mobile?.unnamedFocusableCount ?? '—'}; unable to receive focus: ${locale.mobile?.unfocusableCount ?? '—'}.`,
      `- Initial focus inside dialog: ${locale.states?.freshIsolation?.activeInside ? 'yes' : 'no'}.`,
      `- Header/main inert while open: ${locale.states?.freshIsolation?.outsideInert ? 'yes' : 'no'}.`,
      `- Tab wrap: ${locale.states?.freshFocusTrap?.forwardWrapped ? 'yes' : 'no'}; Shift+Tab wrap: ${locale.states?.freshFocusTrap?.backwardWrapped ? 'yes' : 'no'}.`,
      ''
    );
  }
  lines.push(
    '## Method',
    '',
    '1. Launch an installed Chrome build in headless mode with a new temporary profile and a 390×844 emulated viewport.',
    '2. Observe CDP Network, Log and Runtime events from before each navigation; classify only GTM, GA4 and Microsoft Clarity endpoints.',
    '3. Exercise fresh, close, reject, accept, footer-preferences, withdrawal and clean-reload paths independently on the English and Italian routes.',
    '4. Drive Tab, Shift+Tab and Escape through CDP to prove focus containment, background inertness and focus restoration without depending on translated button copy.',
    '5. Require an affirmative action before the single GTM request, successful GA4 and Clarity responses, and no CSP-blocked resource.',
    '6. Seed only synthetic, origin-readable analytics artefacts before withdrawal, then prove that the consent manager removes them.',
    '',
    'Request URLs in JSON evidence retain only origin/path and parameter names; query values, cookie values and request bodies are never written.',
    ''
  );
  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(usage());
    return;
  }
  if (!args.url) throw new Error('A target URL is required via CONSENT_QA_URL, --url, or a positional argument.');
  const parsedUrl = new URL(args.url);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Target URL must use HTTP or HTTPS.');
  parsedUrl.pathname = '/';
  parsedUrl.search = '';
  parsedUrl.hash = '';
  const targetOrigin = parsedUrl.origin;

  await Promise.all([
    mkdir(path.dirname(args.output), { recursive: true }),
    mkdir(path.dirname(args.report), { recursive: true })
  ]);

  const chrome = await findChrome(args.chrome);
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'aetheris-consent-qa-'));
  const evidence = {
    schemaVersion: '1.1.0',
    capturedAt: new Date().toISOString(),
    targetOrigin,
    browser: 'Installed Chrome controlled through CDP',
    chromeExecutable: chrome,
    viewport: MOBILE_VIEWPORT,
    checks: [],
    phases: {},
    states: {},
    mobile: {},
    locales: [],
    infrastructureErrors: [],
    summary: { pass: false, checkCount: 0, failureCount: 0 }
  };

  try {
    for (const locale of LOCALES) {
      const target = new URL(locale.path, targetOrigin).toString();
      const localeEvidence = {
        id: locale.id,
        locale: locale.id,
        label: locale.label,
        target: sanitiseUrl(target),
        checks: [],
        phases: {},
        states: {},
        mobile: null,
        infrastructureError: null,
        summary: { pass: false, checkCount: 0, failureCount: 0 }
      };
      const profileDir = path.join(temporaryRoot, `chrome-profile-${locale.id}`);
      const cdpPort = await getFreePort();

      try {
        await runAudit({
          url: target,
          chrome,
          cdpPort,
          profileDir,
          settleMs: args.settleMs,
          acceptTimeoutMs: args.acceptTimeoutMs,
          evidence: localeEvidence
        });
      } catch (error) {
        localeEvidence.infrastructureError = error instanceof Error ? error.stack || error.message : String(error);
        addCheck(
          localeEvidence,
          'infrastructure',
          'Audit completed without infrastructure/runtime error',
          false,
          null,
          localeEvidence.infrastructureError
        );
        evidence.infrastructureErrors.push({ locale: locale.id, error: localeEvidence.infrastructureError });
      } finally {
        localeEvidence.summary.checkCount = localeEvidence.checks.length;
        localeEvidence.summary.failureCount = localeEvidence.checks.filter((check) => !check.pass).length;
        localeEvidence.summary.pass = localeEvidence.summary.failureCount === 0 && !localeEvidence.infrastructureError;
        evidence.locales.push(localeEvidence);
        evidence.checks.push(...localeEvidence.checks);
        evidence.mobile[locale.id] = localeEvidence.mobile;
        evidence.states[locale.id] = localeEvidence.states;
        for (const [name, phase] of Object.entries(localeEvidence.phases)) {
          evidence.phases[`${locale.id}:${name}`] = phase;
        }
      }
    }
  } finally {
    evidence.summary.checkCount = evidence.checks.length;
    evidence.summary.failureCount = evidence.checks.filter((check) => !check.pass).length;
    evidence.summary.pass = evidence.summary.failureCount === 0
      && evidence.infrastructureErrors.length === 0
      && evidence.locales.length === LOCALES.length;
    await Promise.all([
      writeFile(args.output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8'),
      writeFile(args.report, reportFor(evidence), 'utf8')
    ]);
    if (!args.keepProfile) await rm(temporaryRoot, { recursive: true, force: true });
    else process.stdout.write(`Chrome profile: ${temporaryRoot}\n`);
  }

  process.stdout.write(`${args.output}\n${args.report}\n`);
  process.stdout.write(`Consent/analytics gate: ${evidence.summary.pass ? 'PASS' : 'FAIL'} (${evidence.summary.failureCount} failure(s))\n`);
  if (!evidence.summary.pass) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
