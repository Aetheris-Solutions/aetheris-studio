import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from 'react';
import { AetherisMark } from './components/AetherisMark';
import { CanvasErrorBoundary } from './components/CanvasErrorBoundary';
import { ConsentManager } from './components/ConsentManager';
import { HomeSections } from './components/HomeSections';
import { QUALIFICATION_URL } from './content/home';
import { translate as t } from './i18n';
import type { AssetStatus } from './components/OculusCanvas';
import { SiteHeader } from './components/SiteHeader';
import {
  getMotionProfile,
  sampleTimeline,
  sampleTimelineProgress,
  settledSnapshot,
  type MotionProfileName,
  type MotionSnapshot
} from './motion/controller';
import {
  heroScrollProgress,
  isTabletPortraitPresentation,
  webglPresentationOpacity
} from './runtime/presentationPolicy';

const OculusCanvas = lazy(() => import('./components/OculusCanvas'));
const SESSION_KEY = 'aetheris-production-hero-intro-v1';
const WEBGL_PREWARM_TIMEOUT_MS = 5_000;

type NetworkInformation = { saveData?: boolean };

type BootDecision = {
  profile: MotionProfileName;
  shouldPlay: boolean;
  shouldRenderMotion: boolean;
  qaTime: number | null;
  reduce: boolean;
  saveData: boolean;
  forceStatic: boolean;
  replay: boolean;
  sessionSeen: boolean;
  webglSupported: boolean;
  reason: string;
};

function storageRead(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function storageRemember(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Session storage is an optimisation, never a rendering dependency.
  }
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function decideBoot(): BootDecision {
  const parameters = new URLSearchParams(location.search);
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const profile = getMotionProfile(aspect);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean((navigator as Navigator & { connection?: NetworkInformation }).connection?.saveData);
  const forceStatic = parameters.get('static') === '1';
  const qaTimeParameter = parameters.get('qa-time');
  const parsedQaTime = qaTimeParameter === null ? Number.NaN : Number(qaTimeParameter);
  const qaTime = Number.isFinite(parsedQaTime) ? Math.max(0, parsedQaTime) : null;
  const replay = parameters.get('replay') === '1';
  const sessionSeen = storageRead();
  const staticBeforeCapabilityProbe = qaTime === null && (forceStatic || reduce || saveData || (!replay && sessionSeen));
  const webglSupported = staticBeforeCapabilityProbe ? true : supportsWebGL();
  const shouldPlay = qaTime === null && !forceStatic && !reduce && !saveData && webglSupported && (replay || !sessionSeen);
  const shouldRenderMotion = webglSupported && (shouldPlay || qaTime !== null);
  const reason = qaTime !== null
    ? 'qa-frozen-frame'
    : shouldPlay
    ? 'playing'
    : forceStatic
      ? 'forced-static'
      : reduce
        ? 'reduced-motion'
        : saveData
          ? 'save-data'
          : !webglSupported
            ? 'webgl-unavailable'
            : 'session-seen';

  return {
    profile,
    shouldPlay,
    shouldRenderMotion,
    qaTime,
    reduce,
    saveData,
    forceStatic,
    replay,
    sessionSeen,
    webglSupported,
    reason
  };
}

function revealStyle(progress: number, distance = 18, glyphBleedEm = 0): CSSProperties {
  const visible = progress > 0.001;
  const complete = progress >= 0.999;
  const cropBottom = `${(1 - progress) * 100}%`;
  return {
    opacity: visible ? 1 : 0,
    visibility: visible ? 'visible' : 'hidden',
    // The reveal crop must disappear once the line is fully shown. Keeping an
    // inset(0) clip on the glyph box trims Playfair's italic overshoot and
    // optical serif extents even though the animation has finished.
    clipPath: complete
      ? 'none'
      : glyphBleedEm > 0
        ? `inset(-${glyphBleedEm}em -${glyphBleedEm}em ${cropBottom} -${glyphBleedEm}em)`
        : `inset(0 0 ${cropBottom} 0)`,
    // Remove the composited text layer as well as the crop at rest. Safari can
    // shave negative italic side-bearings when translate3d(0, 0, 0) survives
    // on the settled glyph even though there is no visible translation.
    transform: complete ? 'none' : `translate3d(0, ${(1 - progress) * distance}px, 0)`
  };
}

function headlineRevealStyle(progress: number, distance: number): CSSProperties {
  const visible = progress > 0.001;
  const complete = progress >= 0.999;

  return {
    opacity: visible ? 1 : 0,
    visibility: visible ? 'visible' : 'hidden',
    // Never crop a display glyph. Playfair's italic `s` paints to the left of
    // its typographic origin, and WebKit can retain a stale clip layer after a
    // composited reveal. The dedicated safe box supplies real paint overscan;
    // the headline entrance therefore uses motion only, with no clip-path at
    // any sampled frame.
    clipPath: 'none',
    transform: complete ? 'none' : `translateY(${(1 - progress) * distance}px)`
  };
}

function removeReplayParameter(): void {
  const url = new URL(location.href);
  if (!url.searchParams.has('replay')) return;
  url.searchParams.delete('replay');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export default function App() {
  const boot = useMemo(decideBoot, []);
  const bootSnapshot = useMemo(
    () => boot.qaTime === null
      ? boot.shouldPlay
        ? sampleTimeline(boot.profile, 0)
        : settledSnapshot(boot.profile)
      : sampleTimeline(boot.profile, boot.qaTime),
    [boot.profile, boot.qaTime, boot.shouldPlay]
  );
  const [profile, setProfile] = useState<MotionProfileName>(boot.profile);
  const [snapshot, setSnapshot] = useState<MotionSnapshot>(bootSnapshot);
  const [introState, setIntroState] = useState<'playing' | 'complete'>(
    boot.shouldPlay || (boot.qaTime !== null && bootSnapshot.normalized < 1) ? 'playing' : 'complete'
  );
  const [completionReason, setCompletionReason] = useState(boot.reason);
  const [assetStatus, setAssetStatus] = useState<AssetStatus>(() =>
    boot.shouldRenderMotion
      ? { kind: 'loading', source: 'glb' }
      : { kind: 'static-poster', source: 'poster', reason: boot.reason }
  );
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [scrollMotionEnabled, setScrollMotionEnabled] = useState(boot.shouldPlay);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const heroRef = useRef<HTMLElement>(null);
  const profileRef = useRef<MotionProfileName>(boot.profile);
  const scrollProgressRef = useRef(bootSnapshot.normalized);
  const scrollCompletionRememberedRef = useRef(false);

  const releaseBootPoster = useCallback(() => {
    requestAnimationFrame(() => document.getElementById('boot-poster')?.remove());
  }, []);

  const finish = useCallback((reason: string) => {
    setIntroState('complete');
    setCompletionReason(reason);
    document.documentElement.dataset.intro = 'complete';
    document.documentElement.dataset.introReason = reason;
    storageRemember();
    removeReplayParameter();
  }, []);

  useEffect(() => {
    const syncProfile = () => {
      setViewportWidth(window.innerWidth);
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const nextProfile = getMotionProfile(aspect);
      if (nextProfile === profileRef.current) return;

      profileRef.current = nextProfile;
      setProfile(nextProfile);
      setSnapshot(
        boot.qaTime === null && scrollMotionEnabled
          ? sampleTimelineProgress(nextProfile, scrollProgressRef.current)
          : boot.qaTime === null
            ? settledSnapshot(nextProfile)
            : sampleTimeline(nextProfile, boot.qaTime)
      );
    };

    window.addEventListener('resize', syncProfile, { passive: true });
    window.addEventListener('orientationchange', syncProfile, { passive: true });
    syncProfile();

    return () => {
      window.removeEventListener('resize', syncProfile);
      window.removeEventListener('orientationchange', syncProfile);
    };
  }, [boot.qaTime, scrollMotionEnabled]);

  useEffect(() => {
    document.documentElement.dataset.intro = introState;
    document.documentElement.dataset.profile = profile;
    document.documentElement.dataset.introReason = completionReason;

    if (!boot.shouldPlay && boot.qaTime === null) storageRemember();
  }, [boot.qaTime, boot.shouldPlay, completionReason, introState, profile]);

  useEffect(() => {
    if (!scrollMotionEnabled || boot.qaTime !== null) return;

    let animationFrame = 0;
    const updateFromScroll = () => {
      animationFrame = 0;
      const hero = heroRef.current;
      if (!hero || document.hidden) return;

      const rect = hero.getBoundingClientRect();
      const stageHeight = hero.querySelector<HTMLElement>('.hero-stage')?.getBoundingClientRect().height;
      const progress = heroScrollProgress(rect.top, rect.height, stageHeight ?? window.innerHeight);
      scrollProgressRef.current = progress;
      setSnapshot(sampleTimelineProgress(profileRef.current, progress));

      const complete = progress >= 0.999;
      setIntroState(complete ? 'complete' : 'playing');
      setCompletionReason(complete ? 'scroll-complete' : 'scroll-driven');
      if (complete && !scrollCompletionRememberedRef.current) {
        scrollCompletionRememberedRef.current = true;
        storageRemember();
        removeReplayParameter();
      }
    };
    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = requestAnimationFrame(updateFromScroll);
    };
    const onVisibility = () => {
      if (!document.hidden) scheduleUpdate();
    };

    updateFromScroll();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    window.addEventListener('orientationchange', scheduleUpdate, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [boot.qaTime, scrollMotionEnabled]);

  useEffect(() => {
    const motionExpected = scrollMotionEnabled || boot.qaTime !== null;
    if (!boot.shouldRenderMotion || !motionExpected || assetStatus.kind !== 'loading') return;

    const timeout = window.setTimeout(() => {
      setCanvasFailed(true);
      setScrollMotionEnabled(false);
      setAssetStatus({
        kind: 'static-poster',
        source: 'poster',
        reason: 'asset-timeout'
      });
      setSnapshot(settledSnapshot(profile));
      finish('asset-timeout');
    }, WEBGL_PREWARM_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [assetStatus.kind, boot.qaTime, boot.shouldRenderMotion, finish, profile, scrollMotionEnabled]);

  const handleCanvasFailure = useCallback(
    (reason: string) => {
      setCanvasFailed(true);
      setScrollMotionEnabled(false);
      setAssetStatus({ kind: 'static-poster', source: 'poster', reason });
      setSnapshot(settledSnapshot(profileRef.current));
      finish(reason);
    },
    [finish]
  );

  const renderCanvas = boot.shouldRenderMotion && !canvasFailed;
  const authoredMotionVisible = scrollMotionEnabled || (boot.qaTime !== null && introState === 'playing');
  // Content is not an intro reward. Keep the complete live-DOM copy available
  // at every camera state; the scroll sequence remains a visual enhancement.
  const visibleCopy = settledSnapshot(profile).copy;
  const tabletPortraitPresentation = isTabletPortraitPresentation(profile, viewportWidth);
  const webglLayerOpacity = webglPresentationOpacity(snapshot, tabletPortraitPresentation);
  const veilOpacity =
    authoredMotionVisible
      ? snapshot.cameraPass <= 0.105
        ? 1
        : Math.max(0, 1 - (snapshot.cameraPass - 0.105) / 0.45)
      : 0;
  const markStyle: CSSProperties = {
    opacity: snapshot.logoOpacity,
    transform: `rotate(${snapshot.logoRotationDeg}deg) scale(${snapshot.logoScale})`
  };
  const cameraZBeforePass = 9 + (1.12 - 9) * snapshot.cameraDolly;
  const screenOffsetRatio = (9 * (1 - snapshot.cameraDolly)) / cameraZBeforePass;
  const markOrigin = profile === 'mobile' ? { x: 64, y: 72 } : { x: 73, y: 50 };
  const markStageStyle: CSSProperties = {
    left: `${50 + (markOrigin.x - 50) * screenOffsetRatio}%`,
    top: `${50 + (markOrigin.y - 50) * screenOffsetRatio}%`
  };
  const statusCopy =
    scrollMotionEnabled && introState === 'playing'
      ? t('Aetheris Studio opening motion follows the page scroll.')
      : introState === 'complete'
        ? t('Aetheris Studio opening motion complete.')
        : t('Aetheris Studio final content is ready.');

  return (
    <>
      <a className="skip-link" href="#hero-copy">
        {t('Skip to hero content')}
      </a>

      <SiteHeader style={revealStyle(visibleCopy.header, -10)} />

      <main>
        <section
          className="hero"
          id="top"
          ref={heroRef}
          aria-labelledby="hero-title"
          data-profile={profile}
          data-runtime-state={introState}
          data-asset-status={assetStatus.kind}
          data-scroll-driven={scrollMotionEnabled ? 'enabled' : 'disabled'}
          data-tablet-poster-handoff={tabletPortraitPresentation ? 'enabled' : 'disabled'}
          data-qa-time={boot.qaTime ?? undefined}
        >
          <div className="hero-stage">
            <picture className="hero-poster" aria-hidden="true">
              <source
                media="(max-aspect-ratio: 0.8/1)"
                srcSet="/posters/aetheris-hero-mobile-456.avif"
                type="image/avif"
              />
              <source
                media="(max-aspect-ratio: 0.8/1)"
                srcSet="/posters/aetheris-hero-mobile-456.webp"
                type="image/webp"
              />
              <source srcSet="/posters/aetheris-hero-desktop-1440.avif" type="image/avif" />
              <img
                src="/posters/aetheris-hero-desktop-1440.webp"
                alt=""
                width="1440"
                height="810"
                fetchPriority="high"
                onLoad={releaseBootPoster}
                onError={releaseBootPoster}
              />
            </picture>

            {renderCanvas && (
              <div className="webgl-layer" style={{ opacity: webglLayerOpacity }}>
                <CanvasErrorBoundary onError={() => handleCanvasFailure('webgl-runtime')}>
                  <Suspense fallback={null}>
                    <OculusCanvas
                      snapshot={snapshot}
                      profile={profile}
                      onAssetStatus={setAssetStatus}
                      onContextLost={() => handleCanvasFailure('webgl-context-loss')}
                    />
                  </Suspense>
                </CanvasErrorBoundary>
              </div>
            )}

            <div className="copy-field-shade" aria-hidden="true" />
            <div className="scene-veil" aria-hidden="true" style={{ opacity: veilOpacity }} />

            {authoredMotionVisible && (
              <div className="mark-stage" aria-hidden="true" style={markStageStyle}>
                <div className="grazing-light" style={{ opacity: snapshot.grazingLight }} />
                <AetherisMark className="canonical-mark" title="Aetheris Studio" style={markStyle} />
              </div>
            )}

            <div className="hero-copy" id="hero-copy">
              <p className="eyebrow" style={revealStyle(visibleCopy.eyebrow, 10)}>
                {t('Integrated commerce growth · Europe')}
              </p>
              <h1 id="hero-title">
                <span className="headline-safe-box">
                  <span className="headline-reveal" style={headlineRevealStyle(visibleCopy.titlePrimary, 30)}>
                    {t('Commerce,')}
                  </span>
                </span>
                <span className="headline-safe-box">
                  <em className="headline-reveal" style={headlineRevealStyle(visibleCopy.titleSecondary, 28)}>
                    {t('seen whole.')}
                  </em>
                </span>
              </h1>
              <p className="hero-intro" style={revealStyle(visibleCopy.body, 16)}>
                {t('We connect storefront, measurement, acquisition, conversion and retention into one accountable growth system for ambitious European consumer brands.')}
              </p>
              <div className="hero-actions" style={revealStyle(visibleCopy.actions, 12)}>
                <a className="button-primary" href={QUALIFICATION_URL}>
                  {t('Qualify your project')} <span aria-hidden="true">↓</span>
                </a>
                <a className="text-link" href="#work">
                  {t('See selected work')} <span aria-hidden="true">↓</span>
                </a>
              </div>
              <p className="hero-fit" style={revealStyle(visibleCopy.actions, 10)}>
                {t('For established consumer brands with active eCommerce across Europe.')}
              </p>
            </div>

            <div className="intro-progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${snapshot.normalized})` }} />
            </div>

            <p className="sr-only" role="status" aria-live="polite">
              {statusCopy}
            </p>
          </div>
        </section>

        <HomeSections />
      </main>
      <ConsentManager />
    </>
  );
}
