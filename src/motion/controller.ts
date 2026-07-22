import motionContractJson from '../contracts/aetheris-hero-motion-v1.json';

export type MotionProfileName = 'desktop' | 'mobile';

type ContractPhase = {
  id: string;
  startSeconds: number;
  endSeconds: number;
};

type MotionProfileContract = {
  durationSeconds: number;
  phases: ContractPhase[];
  copySchedule: {
    startSeconds: number;
    endSeconds: number;
  };
};

type MotionContract = {
  profiles: Record<MotionProfileName, MotionProfileContract>;
  geometryFidelityGate: {
    profiles: Record<MotionProfileName, { endSeconds: number }>;
  };
};

const motionContract = motionContractJson as MotionContract;

export type CopyProgress = {
  header: number;
  eyebrow: number;
  titlePrimary: number;
  titleSecondary: number;
  body: number;
  actions: number;
};

export type MotionSnapshot = {
  profile: MotionProfileName;
  time: number;
  duration: number;
  normalized: number;
  phaseId: string;
  isExactGeometry: boolean;
  isComplete: boolean;
  logoRotationDeg: number;
  logoScale: number;
  logoOpacity: number;
  grazingLight: number;
  webglOpacity: number;
  cameraDolly: number;
  cameraPass: number;
  apertureProgress: number;
  atmosphereOpacity: number;
  copy: CopyProgress;
};

type CopyWindowMap = Record<keyof CopyProgress, readonly [number, number]>;

const COPY_WINDOWS: Record<MotionProfileName, CopyWindowMap> = {
  desktop: {
    header: [2.84, 3.2],
    eyebrow: [2.9, 3.26],
    titlePrimary: [1.46, 1.72],
    titleSecondary: [3.1, 3.74],
    body: [3.36, 3.9],
    actions: [3.6, 4.12]
  },
  mobile: {
    header: [2.48, 2.84],
    eyebrow: [2.62, 2.98],
    titlePrimary: [2.72, 3.25],
    titleSecondary: [2.82, 3.35],
    body: [3.02, 3.47],
    actions: [3.22, 3.8]
  }
};

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function smootherstep(value: number): number {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function rangeProgress(time: number, start: number, end: number): number {
  if (end <= start) return time >= end ? 1 : 0;
  return smootherstep((time - start) / (end - start));
}

export function getMotionProfile(aspectRatio: number): MotionProfileName {
  return aspectRatio <= 0.8 ? 'mobile' : 'desktop';
}

function phaseById(profile: MotionProfileContract, id: string): ContractPhase {
  const phase = profile.phases.find((item) => item.id === id);
  if (!phase) throw new Error(`Motion contract is missing phase: ${id}`);
  return phase;
}

function copyProgress(profile: MotionProfileName, time: number): CopyProgress {
  const windows = COPY_WINDOWS[profile];
  return Object.fromEntries(
    Object.entries(windows).map(([key, [start, end]]) => [key, rangeProgress(time, start, end)])
  ) as CopyProgress;
}

export function sampleTimeline(profileName: MotionProfileName, inputTime: number): MotionSnapshot {
  const profile = motionContract.profiles[profileName];
  const duration = profile.durationSeconds;
  const time = Math.min(duration, Math.max(0, inputTime));
  const rotate = phaseById(profile, 'rigid-rotation');
  const hold = phaseById(profile, 'horus-hold');
  const dolly = phaseById(profile, 'camera-dolly');
  const reveal = phaseById(profile, 'aperture-reveal');
  const fidelityGate = motionContract.geometryFidelityGate.profiles[profileName].endSeconds;
  const rotationProgress = rangeProgress(time, rotate.startSeconds, rotate.endSeconds);
  const cameraDolly = rangeProgress(time, dolly.startSeconds, dolly.endSeconds);
  const cameraPass = rangeProgress(time, reveal.startSeconds, reveal.endSeconds);
  const cameraZBeforePass = 9 + (1.12 - 9) * cameraDolly;
  const afterGate = rangeProgress(time, fidelityGate, dolly.endSeconds);
  const markExit = rangeProgress(time, dolly.endSeconds - 0.22, reveal.startSeconds + 0.2);
  const currentPhase =
    profile.phases.find((phase) => time >= phase.startSeconds && time < phase.endSeconds) ??
    profile.phases[profile.phases.length - 1];

  return {
    profile: profileName,
    time,
    duration,
    normalized: duration === 0 ? 1 : time / duration,
    phaseId: time >= duration ? 'complete' : currentPhase.id,
    isExactGeometry: time <= fidelityGate,
    isComplete: time >= duration,
    logoRotationDeg: -90 * rotationProgress,
    // Match the DOM mark to the perspective dolly exactly during the short
    // SVG/WebGL overlap instead of approximating it with a linear scale.
    logoScale: time <= fidelityGate ? 1 : 9 / cameraZBeforePass,
    logoOpacity: 1 - markExit,
    grazingLight:
      rangeProgress(time, rotate.startSeconds - 0.28, rotate.startSeconds + 0.02) *
      (1 - rangeProgress(time, rotate.startSeconds + 0.02, rotate.startSeconds + 0.32)),
    webglOpacity: rangeProgress(time, hold.endSeconds, dolly.startSeconds + (dolly.endSeconds - dolly.startSeconds) * 0.48),
    cameraDolly,
    cameraPass,
    apertureProgress: rangeProgress(time, hold.endSeconds, reveal.endSeconds),
    atmosphereOpacity: afterGate * (1 - rangeProgress(time, reveal.endSeconds, reveal.endSeconds + 0.62)),
    copy: copyProgress(profileName, time)
  };
}

export function settledSnapshot(profile: MotionProfileName): MotionSnapshot {
  return sampleTimeline(profile, motionContract.profiles[profile].durationSeconds);
}

export type TimelineState = {
  elapsed: number;
  complete: boolean;
};

export function advanceTimelineState(
  state: TimelineState,
  deltaSeconds: number,
  profile: MotionProfileName
): TimelineState {
  const duration = motionContract.profiles[profile].durationSeconds;
  const elapsed = Math.min(duration, Math.max(0, state.elapsed + Math.max(0, deltaSeconds)));
  return { elapsed, complete: elapsed >= duration };
}

export class RafTimelineController {
  private animationFrame = 0;
  private elapsed = 0;
  private lastTimestamp: number | null = null;
  private paused = false;
  private destroyed = false;

  constructor(
    private readonly profile: MotionProfileName,
    private readonly onFrame: (snapshot: MotionSnapshot) => void,
    private readonly onComplete: () => void
  ) {}

  start(): void {
    if (this.destroyed) return;
    this.onFrame(sampleTimeline(this.profile, this.elapsed));
    this.animationFrame = requestAnimationFrame(this.tick);
  }

  setPaused(paused: boolean): void {
    if (this.destroyed || this.paused === paused) return;
    this.paused = paused;
    this.lastTimestamp = null;
    if (!paused && !this.animationFrame) {
      this.animationFrame = requestAnimationFrame(this.tick);
    }
  }

  skip(): void {
    if (this.destroyed) return;
    this.elapsed = motionContract.profiles[this.profile].durationSeconds;
    this.onFrame(settledSnapshot(this.profile));
    this.onComplete();
    this.destroy();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
  }

  private readonly tick = (timestamp: number): void => {
    this.animationFrame = 0;
    if (this.destroyed || this.paused) return;

    if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
    const delta = Math.min(0.1, Math.max(0, (timestamp - this.lastTimestamp) / 1000));
    this.lastTimestamp = timestamp;
    const next = advanceTimelineState({ elapsed: this.elapsed, complete: false }, delta, this.profile);
    this.elapsed = next.elapsed;
    this.onFrame(sampleTimeline(this.profile, this.elapsed));

    if (next.complete) {
      this.onComplete();
      this.destroy();
      return;
    }

    this.animationFrame = requestAnimationFrame(this.tick);
  };
}

export const heroMotionContract = motionContract;
