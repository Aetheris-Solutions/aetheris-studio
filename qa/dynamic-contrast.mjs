#!/usr/bin/env node

/**
 * Deterministic dynamic-contrast audit for the Aetheris WebGL hero.
 *
 * The app's `?qa-time=<seconds>` mode freezes the authored motion timeline.
 * This runner builds paired screenshots (copy shown / copy transparent), derives
 * the rendered core-glyph pixels and compares each one with its exact backdrop.
 * Stable-frame failures exit non-zero. Transitional fade failures are retained
 * as evidence and become fatal only with `--strict-transitions`.
 */

import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_JSON = path.join(SCRIPT_DIR, 'artifacts/webgl-v2-dynamic-contrast-evidence.json');
const DEFAULT_REPORT = path.join(SCRIPT_DIR, 'artifacts/WEBGL-V2-DYNAMIC-CONTRAST-AUDIT.md');
const VITE_BIN = path.join(APP_DIR, 'node_modules/vite/bin/vite.js');
const CORE_GLYPH_DELTA_RATIO = 0.55;
const MIN_RENDERED_DELTA = 2;

const LOCALES = [
  { id: 'en', path: '/', label: 'English' },
  { id: 'it', path: '/it/', label: 'Italian' }
];

const TARGETS = {
  desktop: [
    { selector: '.brand > span', label: 'Brand wordmark', threshold: 4.5 },
    { selector: '.primary-nav a:nth-child(1)', label: 'Navigation · Work', threshold: 4.5 },
    { selector: '.primary-nav a:nth-child(2)', label: 'Navigation · System', threshold: 4.5 },
    { selector: '.primary-nav a:nth-child(3)', label: 'Navigation · Engagement', threshold: 4.5 },
    { selector: '.primary-nav a:nth-child(4)', label: 'Navigation · Studio', threshold: 4.5 },
    { selector: '.header-cta', label: 'Header · Book a call', threshold: 4.5 },
    { selector: '.locale-switch', label: 'Header · Locale switch', threshold: 4.5 },
    { selector: '.eyebrow', label: 'Hero eyebrow', threshold: 4.5 },
    { selector: '.hero h1 .headline-safe-box:nth-child(1) > span', label: 'H1 · primary line', threshold: 3 },
    { selector: '.hero h1 .headline-safe-box:nth-child(2) > em', label: 'H1 · secondary line', threshold: 3 },
    { selector: '.hero-intro', label: 'Hero introduction', threshold: 4.5 },
    { selector: '.button-primary', label: 'Primary action', threshold: 4.5, contrastMode: 'computed-own-background' },
    { selector: '.text-link', label: 'Secondary action', threshold: 4.5 },
    { selector: '.hero-fit', label: 'Hero fit statement', threshold: 4.5 },
    { selector: '.intro-skip', label: 'Skip intro', threshold: 4.5, stableRequired: false }
  ],
  mobile: [
    { selector: '.brand > span', label: 'Brand wordmark', threshold: 4.5 },
    { selector: '.eyebrow', label: 'Hero eyebrow', threshold: 4.5 },
    { selector: '.hero h1 .headline-safe-box:nth-child(1) > span', label: 'H1 · primary line', threshold: 3 },
    { selector: '.hero h1 .headline-safe-box:nth-child(2) > em', label: 'H1 · secondary line', threshold: 3 },
    { selector: '.hero-intro', label: 'Hero introduction', threshold: 4.5 },
    { selector: '.button-primary', label: 'Primary action', threshold: 4.5, contrastMode: 'computed-own-background' },
    { selector: '.text-link', label: 'Secondary action', threshold: 4.5 },
    { selector: '.intro-skip', label: 'Skip intro', threshold: 4.5, stableRequired: false }
  ]
};

const PROFILES = [
  {
    id: 'desktop',
    viewport: { width: 1440, height: 900, mobile: false },
    times: [0, 1.5, 1.58, 1.72, 2.9, 3.1, 3.3, 3.5, 3.7, 3.9, 4.15, 4.8]
  },
  {
    id: 'mobile',
    viewport: { width: 390, height: 844, mobile: true },
    times: [0, 2.65, 2.85, 3, 3.15, 3.3, 3.5, 3.7, 4]
  },
  {
    id: 'tablet-portrait',
    targetSet: 'mobile',
    viewport: { width: 1024, height: 1366, mobile: true },
    times: [0, 2.65, 2.85, 3, 3.15, 3.28, 3.4, 3.55, 3.7, 3.88, 4]
  },
  {
    id: 'desktop-landscape',
    targetSet: 'desktop',
    viewport: { width: 1366, height: 768, mobile: false },
    times: [0, 1.58, 1.72, 3.1, 3.5, 3.7, 3.9, 4.8]
  }
];

function parseArgs(argv) {
  const args = {
    chrome: process.env.CHROME_BIN || null,
    imageMagick: process.env.MAGICK_BIN || null,
    output: DEFAULT_JSON,
    report: DEFAULT_REPORT,
    strictTransitions: false,
    keepArtifacts: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === '--chrome') args.chrome = argv[++index];
    else if (option === '--magick') args.imageMagick = argv[++index];
    else if (option === '--output') args.output = path.resolve(argv[++index]);
    else if (option === '--report') args.report = path.resolve(argv[++index]);
    else if (option === '--strict-transitions') args.strictTransitions = true;
    else if (option === '--keep-artifacts') args.keepArtifacts = true;
    else if (option === '--help' || option === '-h') args.help = true;
    else throw new Error(`Unknown option: ${option}`);
  }
  return args;
}

function usage() {
  return `Aetheris dynamic contrast audit

Usage:
  node qa/dynamic-contrast.mjs [options]

Options:
  --chrome <path>          Chromium/Chrome executable
  --magick <path>          ImageMagick executable
  --output <path>          JSON evidence destination
  --report <path>          Markdown report destination
  --strict-transitions     Fail on sampled opacity-transition failures too
  --keep-artifacts         Keep paired screenshots in the printed temp folder
  -h, --help               Show this help
`;
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result ?? {});
    });
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

async function findImageMagick(explicit) {
  const candidates = [explicit, '/opt/homebrew/bin/magick', '/usr/local/bin/magick', '/usr/bin/magick'];
  for (const candidate of candidates) if (await canAccess(candidate)) return candidate;
  throw new Error('ImageMagick `magick` not found. Pass --magick or set MAGICK_BIN.');
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
      if (response.ok) return response;
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

async function launchPreview(port) {
  const child = spawn(process.execPath, [VITE_BIN, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: APP_DIR,
    env: { ...process.env, NO_COLOR: '1' },
    stdio: 'ignore'
  });
  child.once('error', () => {});
  await waitForHttp(`http://127.0.0.1:${port}/`, 15_000, 'Vite preview');
  return child;
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
    '--window-size=1440,900',
    'about:blank'
  ], { stdio: 'ignore' });
  child.once('error', () => {});
  await waitForHttp(`http://127.0.0.1:${port}/json/version`, 15_000, 'Chrome CDP');
  return child;
}

async function createAuditPage(cdpPort, profile) {
  const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?about%3Ablank`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Chrome could not create an audit page: ${response.status} ${response.statusText}`);
  const target = await response.json();
  if (!target.webSocketDebuggerUrl) throw new Error('Chrome audit page has no CDP WebSocket URL.');
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await Promise.all([
    client.send('Page.enable'),
    client.send('Runtime.enable'),
    client.send('Network.enable')
  ]);
  await configureViewport(client, profile);
  return client;
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

async function configureViewport(client, profile) {
  await client.send('Emulation.setEmulatedMedia', {
    media: '',
    features: [
      { name: 'prefers-reduced-motion', value: 'no-preference' },
      { name: 'prefers-color-scheme', value: 'dark' }
    ]
  });
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: profile.viewport.width,
    height: profile.viewport.height,
    deviceScaleFactor: 1,
    mobile: profile.viewport.mobile,
    screenWidth: profile.viewport.width,
    screenHeight: profile.viewport.height,
    screenOrientation: {
      type: profile.viewport.width > profile.viewport.height ? 'landscapePrimary' : 'portraitPrimary',
      angle: 0
    }
  });
}

async function waitForFrozenFrame(client, expectedTime, timeoutMs = 20_000) {
  const started = Date.now();
  let latest = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const raw = await evaluate(client, `JSON.stringify((() => {
        const hero = document.querySelector('.hero');
        return {
          ready: document.readyState,
          fonts: document.fonts?.status || 'loaded',
          asset: hero?.dataset.assetStatus || null,
          qaTime: hero?.dataset.qaTime || null,
          profile: hero?.dataset.profile || null,
          canvas: Boolean(document.querySelector('.webgl-layer canvas')),
          width: innerWidth,
          height: innerHeight
        };
      })())`);
      latest = JSON.parse(raw);
      const exactTime = Math.abs(Number(latest.qaTime) - expectedTime) < 0.0001;
      if (latest.ready === 'complete' && latest.fonts === 'loaded' && latest.asset === 'production' && latest.canvas && exactTime) {
        await evaluate(client, 'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
        await sleep(80);
        return latest;
      }
    } catch {
      // Navigation replaces the runtime realm; retry until it settles.
    }
    await sleep(80);
  }
  throw new Error(`Frozen frame ${expectedTime.toFixed(2)}s did not become production-ready: ${JSON.stringify(latest)}`);
}

async function capturePng(client) {
  const result = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false
  });
  return Buffer.from(result.data, 'base64');
}

function pngDimensions(png) {
  const signature = png.subarray(1, 4).toString('ascii');
  if (signature !== 'PNG' || png.length < 24) throw new Error('Chrome returned an invalid PNG screenshot.');
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

async function runBinary(executable, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) resolve(Buffer.concat(stdout));
      else reject(new Error(`${path.basename(executable)} exited ${code}: ${Buffer.concat(stderr).toString('utf8')}`));
    });
  });
}

async function decodeRgba(magick, filePath, dimensions) {
  const rgba = await runBinary(magick, [filePath, '-alpha', 'on', '-depth', '8', 'rgba:-']);
  const expectedBytes = dimensions.width * dimensions.height * 4;
  if (rgba.length !== expectedBytes) {
    throw new Error(`Unexpected RGBA size for ${path.basename(filePath)}: ${rgba.length}; expected ${expectedBytes}.`);
  }
  return rgba;
}

function srgbChannel(value) {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(red, green, blue) {
  return 0.2126 * srgbChannel(red) + 0.7152 * srgbChannel(green) + 0.0722 * srgbChannel(blue);
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = luminance(foreground[0], foreground[1], foreground[2]);
  const backgroundLuminance = luminance(background[0], background[1], background[2]);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

function percentile(sorted, quantile) {
  if (!sorted.length) return null;
  const position = (sorted.length - 1) * quantile;
  const base = Math.floor(position);
  const remainder = position - base;
  const next = sorted[base + 1];
  return next === undefined ? sorted[base] : sorted[base] + remainder * (next - sorted[base]);
}

function fixed(value, digits = 3) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? null
    : Number(value.toFixed(digits));
}

function analyseTarget(target, shown, backdrop, imageDimensions, viewport) {
  if (!target.exists || target.rect.width <= 0 || target.rect.height <= 0) {
    return { ...target, present: false, reason: 'not-rendered', corePixelCount: 0, pass: null };
  }

  // A fully transparent authored target has no visible glyphs to assess. A
  // paired WebGL capture can still contain a few changed background pixels
  // inside its layout rect; treating those pixels as text would manufacture a
  // 1:1 failure for copy that is not rendered at this timeline sample.
  if (target.effectiveOpacity <= 0.001) {
    return { ...target, present: false, reason: 'authored-opacity-zero', corePixelCount: 0, pass: null };
  }

  if (target.contrastMode === 'computed-own-background') {
    if (target.effectiveOpacity < 0.999 || !target.authoredColor || !target.authoredBackground) {
      return {
        ...target,
        present: false,
        reason: target.effectiveOpacity < 0.999
          ? 'own-background-transition'
          : 'missing-computed-colour',
        corePixelCount: 0,
        pass: null
      };
    }
    const foreground = [
      target.authoredColor.red,
      target.authoredColor.green,
      target.authoredColor.blue
    ];
    const background = [
      target.authoredBackground.red,
      target.authoredBackground.green,
      target.authoredBackground.blue
    ];
    const ratio = contrastRatio(foreground, background);
    return {
      ...target,
      present: true,
      reason: null,
      corePixelCount: null,
      contrast: { minimum: fixed(ratio), p01: fixed(ratio), p05: fixed(ratio), median: fixed(ratio) },
      renderedPixelDiagnostic: null,
      pass: ratio >= target.threshold
    };
  }

  const scaleX = imageDimensions.width / viewport.width;
  const scaleY = imageDimensions.height / viewport.height;
  const left = Math.max(0, Math.floor(target.rect.left * scaleX));
  const top = Math.max(0, Math.floor(target.rect.top * scaleY));
  const right = Math.min(imageDimensions.width, Math.ceil(target.rect.right * scaleX));
  const bottom = Math.min(imageDimensions.height, Math.ceil(target.rect.bottom * scaleY));
  if (right <= left || bottom <= top) {
    return { ...target, present: false, reason: 'outside-viewport', corePixelCount: 0, pass: null };
  }

  let maxDelta = 0;
  const deltas = [];
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const index = (y * imageDimensions.width + x) * 4;
      const delta = Math.max(
        Math.abs(shown[index] - backdrop[index]),
        Math.abs(shown[index + 1] - backdrop[index + 1]),
        Math.abs(shown[index + 2] - backdrop[index + 2])
      );
      if (delta > maxDelta) maxDelta = delta;
      deltas.push({ index, delta });
    }
  }

  if (maxDelta < MIN_RENDERED_DELTA) {
    return {
      ...target,
      present: false,
      reason: target.effectiveOpacity <= 0.001 ? 'authored-opacity-zero' : 'no-rendered-glyph-delta',
      maxPixelDelta: maxDelta,
      corePixelCount: 0,
      pass: null
    };
  }

  const coreThreshold = Math.max(MIN_RENDERED_DELTA, maxDelta * CORE_GLYPH_DELTA_RATIO);
  const ratios = [];
  const renderedPixelRatios = [];
  const authored = target.authoredColor;
  const authoredAlpha = Math.max(0, Math.min(1, (authored?.alpha ?? 1) * target.effectiveOpacity));
  for (const { index, delta } of deltas) {
    if (delta < coreThreshold) continue;
    const background = [backdrop[index], backdrop[index + 1], backdrop[index + 2]];
    const renderedForeground = [shown[index], shown[index + 1], shown[index + 2]];
    renderedPixelRatios.push(contrastRatio(renderedForeground, background));
    const effectiveForeground = authored
      ? [
          authored.red * authoredAlpha + background[0] * (1 - authoredAlpha),
          authored.green * authoredAlpha + background[1] * (1 - authoredAlpha),
          authored.blue * authoredAlpha + background[2] * (1 - authoredAlpha)
        ]
      : renderedForeground;
    ratios.push(contrastRatio(effectiveForeground, background));
  }
  ratios.sort((a, b) => a - b);
  renderedPixelRatios.sort((a, b) => a - b);
  const minimum = ratios[0] ?? null;

  return {
    ...target,
    present: ratios.length > 0,
    reason: ratios.length > 0 ? null : 'no-core-glyph-pixels',
    maxPixelDelta: maxDelta,
    coreDeltaThreshold: fixed(coreThreshold),
    corePixelCount: ratios.length,
    contrast: {
      minimum: fixed(minimum),
      p01: fixed(percentile(ratios, 0.01)),
      p05: fixed(percentile(ratios, 0.05)),
      median: fixed(percentile(ratios, 0.5))
    },
    renderedPixelDiagnostic: {
      minimum: fixed(renderedPixelRatios[0]),
      p05: fixed(percentile(renderedPixelRatios, 0.05)),
      median: fixed(percentile(renderedPixelRatios, 0.5))
    },
    pass: minimum !== null && minimum >= target.threshold
  };
}

async function collectTargetInfo(client, targets) {
  const raw = await evaluate(client, `JSON.stringify((() => {
    const specs = ${JSON.stringify(targets)};
    const effectiveOpacity = (element) => {
      let opacity = 1;
      for (let current = element; current instanceof Element; current = current.parentElement) {
        opacity *= Number.parseFloat(getComputedStyle(current).opacity || '1');
      }
      return opacity;
    };
    const parseColor = (value) => {
      const channels = String(value).match(/[0-9.]+/g)?.map(Number) || [];
      if (channels.length < 3) return null;
      return { red: channels[0], green: channels[1], blue: channels[2], alpha: channels[3] ?? 1, css: value };
    };
    return specs.map((spec) => {
      const element = document.querySelector(spec.selector);
      if (!element) return { ...spec, exists: false, effectiveOpacity: 0, rect: { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 } };
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        ...spec,
        exists: true,
        effectiveOpacity: effectiveOpacity(element),
        authoredColor: parseColor(style.color),
        authoredBackground: parseColor(style.backgroundColor),
        fontSizePx: Number.parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }
      };
    });
  })())`);
  return JSON.parse(raw);
}

async function injectTransparentTextStyle(client, targets) {
  const selectors = targets
    .filter((target) => target.contrastMode !== 'computed-own-background')
    .flatMap((target) => [target.selector, `${target.selector} *`]);
  const css = `${selectors.join(',\n')} {
    color: transparent !important;
    -webkit-text-fill-color: transparent !important;
    text-shadow: none !important;
  }`;
  await evaluate(client, `(() => {
    document.getElementById('aetheris-contrast-hide-copy')?.remove();
    const style = document.createElement('style');
    style.id = 'aetheris-contrast-hide-copy';
    style.textContent = ${JSON.stringify(css)};
    document.head.append(style);
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  })()`);
  // Chrome can retain a cached text layer for one compositor frame even after
  // computed style has changed. Let the transparent pair reach the screenshot
  // surface so static button labels are measured, not sub-pixel canvas drift.
  await sleep(350);
}

async function auditFrame({ client, baseUrl, profile, time, targets, magick, artifactDir }) {
  const url = new URL(baseUrl);
  url.searchParams.set('qa-time', String(time));
  url.searchParams.set('contrast-profile', profile.id);
  url.searchParams.set('contrast-run', String(Date.now()));
  await client.send('Page.navigate', { url: url.toString() });
  const runtime = await waitForFrozenFrame(client, time);
  await evaluate(client, 'scrollTo(0, 0); true');

  const targetInfo = await collectTargetInfo(client, targets);
  const shownPng = await capturePng(client);
  await injectTransparentTextStyle(client, targets);
  const backdropPng = await capturePng(client);

  const stem = `${profile.id}-${String(time).replace('.', '_')}`;
  const shownPath = path.join(artifactDir, `${stem}-shown.png`);
  const backdropPath = path.join(artifactDir, `${stem}-backdrop.png`);
  await Promise.all([writeFile(shownPath, shownPng), writeFile(backdropPath, backdropPng)]);

  const dimensions = pngDimensions(shownPng);
  const backdropDimensions = pngDimensions(backdropPng);
  if (dimensions.width !== backdropDimensions.width || dimensions.height !== backdropDimensions.height) {
    throw new Error(`Paired screenshot dimensions differ at ${profile.id} ${time}s.`);
  }
  const [shown, backdrop] = await Promise.all([
    decodeRgba(magick, shownPath, dimensions),
    decodeRgba(magick, backdropPath, dimensions)
  ]);

  const measurements = targetInfo.map((target) => analyseTarget(
    target,
    shown,
    backdrop,
    dimensions,
    profile.viewport
  ));
  const rendered = measurements.filter((measurement) => measurement.present);
  const failures = rendered.filter((measurement) => !measurement.pass);
  return {
    timeSeconds: time,
    runtime,
    screenshot: dimensions,
    renderedTargetCount: rendered.length,
    failureCount: failures.length,
    sampledFramePass: failures.length === 0,
    measurements
  };
}

function summarizeProfile(profileResult) {
  const finalFrame = profileResult.samples.at(-1);
  const stableMeasurements = finalFrame.measurements.filter((measurement) => measurement.stableRequired !== false);
  const stableFailures = stableMeasurements.filter((measurement) => !measurement.present || !measurement.pass);
  const transitionFailures = profileResult.samples
    .slice(0, -1)
    .flatMap((sample) => sample.measurements
      .filter((measurement) => measurement.present && !measurement.pass)
      .map((measurement) => ({
        timeSeconds: sample.timeSeconds,
        selector: measurement.selector,
        label: measurement.label,
        threshold: measurement.threshold,
        minimum: measurement.contrast?.minimum ?? null,
        effectiveOpacity: fixed(measurement.effectiveOpacity)
      })));
  return {
    stableTimeSeconds: finalFrame.timeSeconds,
    stablePass: stableFailures.length === 0,
    stableFailureCount: stableFailures.length,
    stableFailures: stableFailures.map((measurement) => ({
      selector: measurement.selector,
      label: measurement.label,
      present: measurement.present,
      threshold: measurement.threshold,
      minimum: measurement.contrast?.minimum ?? null
    })),
    sampledTransitionPass: transitionFailures.length === 0,
    transitionFailureCount: transitionFailures.length,
    transitionFailures
  };
}

function ratioCell(measurement) {
  if (!measurement?.present) return 'not rendered';
  return `${measurement.contrast.minimum.toFixed(3)}:1`;
}

function passCell(measurement) {
  if (!measurement?.present) return 'Not rendered';
  return measurement.pass ? 'PASS' : 'FAIL';
}

function generatedReport(evidence) {
  const stablePass = evidence.summary.stablePass;
  const strictPass = evidence.summary.allSampledFramesPass;
  const lines = [
    '# Aetheris WebGL hero — automated dynamic-contrast audit',
    '',
    `Audit generated: ${evidence.capturedAt}`,
    '',
    '## Verdict',
    '',
    `**Stable/final presentation: ${stablePass ? 'PASS' : 'FAIL'}.** ${stablePass
      ? 'Every required text target passes its WCAG threshold in every frozen final EN/IT viewport composition.'
      : 'At least one required text target fails or is missing in a frozen final composition.'}`,
    '',
    `**Every sampled motion frame: ${strictPass ? 'PASS' : 'FAIL'}.** ${strictPass
      ? 'No below-threshold rendered glyph was found in the sampled timeline.'
      : 'Opacity-based reveals create below-threshold rendered glyphs during part of the transition. These findings are retained as warnings by the default gate and become fatal with `--strict-transitions`.'}`,
    '',
    '## Stable state results',
    '',
    '| Viewport | Selector / content | Core-glyph minimum | Threshold | Result |',
    '|---|---|---:|---:|---|'
  ];

  for (const profile of evidence.profiles) {
    const finalFrame = profile.samples.at(-1);
    for (const measurement of finalFrame.measurements.filter((entry) => entry.stableRequired !== false)) {
      lines.push(`| ${profile.id} | \`${measurement.selector}\` · ${measurement.label} | ${ratioCell(measurement)} | ${measurement.threshold.toFixed(1)}:1 | ${passCell(measurement)} |`);
    }
  }

  lines.push('', '## Sampled transition findings', '');
  for (const profile of evidence.profiles) {
    const summary = profile.summary;
    lines.push(`### ${profile.id[0].toUpperCase()}${profile.id.slice(1)}`, '');
    lines.push(`Sample times: ${profile.times.map((time) => `${time.toFixed(2)} s`).join(', ')}.`);
    lines.push('');
    if (summary.transitionFailures.length === 0) {
      lines.push('No sampled transition failures.', '');
      continue;
    }
    lines.push('| Time | Target | Effective opacity | Minimum | Threshold |', '|---:|---|---:|---:|---:|');
    for (const failure of summary.transitionFailures) {
      lines.push(`| ${failure.timeSeconds.toFixed(2)} s | \`${failure.selector}\` | ${failure.effectiveOpacity?.toFixed(3) ?? '—'} | ${failure.minimum?.toFixed(3) ?? '—'}:1 | ${failure.threshold.toFixed(1)}:1 |`);
    }
    lines.push('');
  }

  lines.push(
    '## Method',
    '',
    '1. Build and launch the production Vite preview in an isolated local process.',
    '2. Launch headless Chrome and set exact desktop, mobile, portrait-tablet and landscape viewports at DPR 1 through CDP.',
    '3. Navigate to both English and Italian routes at each deterministic `?qa-time=<seconds>` frame and require the production GLB, loaded fonts and live WebGL canvas.',
    '4. Capture one shown frame and one paired frame in which only the audited text colour is made transparent. Backgrounds, borders, blur, transforms, opacity and layout remain unchanged.',
    `5. Select core glyph locations at ${Math.round(CORE_GLYPH_DELTA_RATIO * 100)}% or more of each target’s maximum RGB delta, then composite the computed CSS foreground (including colour alpha and effective ancestor opacity) against the exact paired backdrop pixel before applying WCAG relative luminance.`,
    '6. Assess H1 lines at 3:1 and all normal/small copy at 4.5:1.',
    '',
    '## Gate semantics',
    '',
    '- `npm run qa:contrast` exits non-zero for a stable/final failure, a missing required stable target, a missing production GLB, or a capture/runtime error.',
    '- `npm run qa:contrast -- --strict-transitions` also exits non-zero for any sampled opacity-transition failure.',
    '- The full per-frame measurements, rectangles, opacity, percentile distribution and runtime state are stored in [`webgl-v2-dynamic-contrast-evidence.json`](./webgl-v2-dynamic-contrast-evidence.json).',
    '',
    '## Evidence caveats',
    '',
    '- This is a rendered Chromium audit on the current development host, not a physical-device measurement.',
    '- The compact header intentionally hides the desktop locale switch; that control is contrast-gated in the desktop and landscape profiles where it is rendered.',
    '- Frozen timeline frames remove capture drift from the authored camera timeline; the paired screenshots preserve the exact WebGL/material backdrop for each sampled composition.',
    '- Core-glyph locations intentionally exclude antialias fringes. The primary action has its own fully opaque authored background, so its WCAG ratio is computed directly from the browser’s foreground/background colours once the action group reaches full opacity; all text over animated scene pixels uses paired screenshots.',
    '- The JSON also retains actual screenshot-pixel contrast as an antialiasing diagnostic, but the WCAG gate uses the computed CSS foreground because rasterizer smoothing is not part of the authored contrast requirement.',
    '- Any substantive change to backdrop, lights, camera, materials, copy position or text treatment invalidates this evidence and must rerun the command.',
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

  await Promise.all([
    mkdir(path.dirname(args.output), { recursive: true }),
    mkdir(path.dirname(args.report), { recursive: true })
  ]);

  const [chrome, magick] = await Promise.all([findChrome(args.chrome), findImageMagick(args.imageMagick)]);
  const artifactDir = await mkdtemp(path.join(os.tmpdir(), 'aetheris-dynamic-contrast-'));
  const previewPort = await getFreePort();
  let cdpPort = await getFreePort();
  while (cdpPort === previewPort) cdpPort = await getFreePort();
  const chromeProfile = path.join(artifactDir, 'chrome-profile');
  let preview = null;
  let browser = null;

  try {
    preview = await launchPreview(previewPort);
    browser = await launchChrome(chrome, cdpPort, chromeProfile);

    const previewOrigin = `http://127.0.0.1:${previewPort}`;
    const profileResults = [];
    for (const locale of LOCALES) {
      const baseUrl = new URL(locale.path, previewOrigin).toString();
      for (const profileDefinition of PROFILES) {
        const profile = {
          ...profileDefinition,
          id: `${locale.id}-${profileDefinition.id}`,
          viewportId: profileDefinition.id,
          targetSet: profileDefinition.targetSet ?? profileDefinition.id,
          locale: locale.id,
          localeLabel: locale.label,
          route: locale.path
        };
        const samples = [];
        for (const time of profile.times) {
          process.stderr.write(`[contrast] ${profile.id} ${time.toFixed(2)}s … `);
          const frameClient = await createAuditPage(cdpPort, profile);
          let sample;
          try {
            sample = await auditFrame({
              client: frameClient,
              baseUrl,
              profile,
              time,
              targets: TARGETS[profile.targetSet],
              magick,
              artifactDir
            });
          } finally {
            await frameClient.send('Page.close').catch(() => {});
            frameClient.close();
          }
          samples.push(sample);
          const failures = sample.measurements
            .filter((measurement) => measurement.present && !measurement.pass)
            .map((measurement) => `${measurement.label} ${measurement.contrast.minimum.toFixed(3)}:1`);
          process.stderr.write(`${sample.sampledFramePass ? 'pass' : failures.join('; ')}\n`);
        }
        const result = { ...profile, samples };
        result.summary = summarizeProfile(result);
        profileResults.push(result);
      }
    }

    const stablePass = profileResults.every((profile) => profile.summary.stablePass);
    const allSampledFramesPass = profileResults.every((profile) => profile.summary.sampledTransitionPass);
    const evidence = {
      schemaVersion: '1.1.0',
      capturedAt: new Date().toISOString(),
      browser: 'Headless Chrome controlled over CDP',
      chromeExecutable: chrome,
      app: 'production/webgl-hero',
      method: {
        timeline: 'deterministic ?qa-time frozen frames',
        pairedCapture: 'shown text versus transparent text with all non-text rendering preserved',
        coreGlyphDeltaRatio: CORE_GLYPH_DELTA_RATIO,
        minimumRenderedRgbDelta: MIN_RENDERED_DELTA,
        wcag: 'computed CSS foreground (including color alpha and ancestor opacity) composited over exact paired backdrop; 3:1 large text, 4.5:1 normal text',
        defaultGate: 'stable/final compositions',
        strictGate: 'all sampled rendered frames'
      },
      locales: LOCALES,
      summary: {
        stablePass,
        allSampledFramesPass,
        defaultGatePass: stablePass,
        strictGatePass: stablePass && allSampledFramesPass,
        stableFailureCount: profileResults.reduce((sum, profile) => sum + profile.summary.stableFailureCount, 0),
        transitionFailureCount: profileResults.reduce((sum, profile) => sum + profile.summary.transitionFailureCount, 0)
      },
      profiles: profileResults
    };

    await Promise.all([
      writeFile(args.output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8'),
      writeFile(args.report, generatedReport(evidence), 'utf8')
    ]);

    process.stdout.write(`${args.output}\n${args.report}\n`);
    process.stdout.write(`Stable gate: ${stablePass ? 'PASS' : 'FAIL'}; sampled every-frame audit: ${allSampledFramesPass ? 'PASS' : 'FAIL'}\n`);
    if (args.keepArtifacts) process.stdout.write(`Paired screenshots: ${artifactDir}\n`);

    if (!stablePass || (args.strictTransitions && !allSampledFramesPass)) process.exitCode = 1;
  } finally {
    await Promise.allSettled([stopProcess(browser), stopProcess(preview)]);
    if (!args.keepArtifacts) await rm(artifactDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
