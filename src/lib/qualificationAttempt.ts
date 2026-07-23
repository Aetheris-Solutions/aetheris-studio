export type QualificationAttempt = Readonly<{
  key: string;
  payload: Readonly<Record<string, unknown>>;
}>;

/**
 * Keep one immutable request identity across an ambiguous network retry. The
 * caller supplies a key that changes whenever form values or consent evidence
 * changes; only then is a new submission allowed to be minted.
 */
export function reuseOrCreateQualificationAttempt(
  current: QualificationAttempt | null,
  key: string,
  createPayload: () => Record<string, unknown>
): QualificationAttempt {
  if (current?.key === key) return current;
  return Object.freeze({
    key,
    payload: Object.freeze({ ...createPayload() })
  });
}

/** Turnstile tokens are single-use/short-lived and must not be frozen. */
export function qualificationRequestPayload(
  attempt: QualificationAttempt,
  turnstileToken: string
): Record<string, unknown> {
  return { ...attempt.payload, turnstileToken };
}
