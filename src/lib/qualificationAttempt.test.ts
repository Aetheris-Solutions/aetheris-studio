import { describe, expect, it, vi } from 'vitest';
import {
  qualificationRequestPayload,
  reuseOrCreateQualificationAttempt
} from './qualificationAttempt';

describe('qualification attempt retries', () => {
  it('reuses identity and evidence after an ambiguous response while refreshing only Turnstile', () => {
    const createPayload = vi.fn(() => ({
      submissionId: 'website_attempt_000001',
      privacyAcceptedAt: '2026-07-22T20:00:00.000Z',
      marketingConsentAt: '2026-07-22T20:00:00.000Z',
      workEmail: 'synthetic@example.test'
    }));

    const firstAttempt = reuseOrCreateQualificationAttempt(null, 'unchanged-form-and-consent', createPayload);
    const retryAttempt = reuseOrCreateQualificationAttempt(firstAttempt, 'unchanged-form-and-consent', createPayload);
    const firstRequest = qualificationRequestPayload(firstAttempt, 'turnstile-token-1');
    const retryRequest = qualificationRequestPayload(retryAttempt, 'turnstile-token-2');

    expect(retryAttempt).toBe(firstAttempt);
    expect(createPayload).toHaveBeenCalledTimes(1);
    expect(retryRequest).toEqual({ ...firstRequest, turnstileToken: 'turnstile-token-2' });
    expect(retryRequest.submissionId).toBe(firstRequest.submissionId);
    expect(retryRequest.privacyAcceptedAt).toBe(firstRequest.privacyAcceptedAt);
  });

  it('mints a new attempt after form or consent evidence changes', () => {
    let sequence = 0;
    const createPayload = vi.fn(() => ({ submissionId: `website_attempt_00000${++sequence}` }));
    const initial = reuseOrCreateQualificationAttempt(null, 'form-a|consent-a', createPayload);
    const changedForm = reuseOrCreateQualificationAttempt(initial, 'form-b|consent-a', createPayload);
    const changedConsent = reuseOrCreateQualificationAttempt(changedForm, 'form-b|consent-b', createPayload);

    expect(initial.payload.submissionId).toBe('website_attempt_000001');
    expect(changedForm.payload.submissionId).toBe('website_attempt_000002');
    expect(changedConsent.payload.submissionId).toBe('website_attempt_000003');
    expect(createPayload).toHaveBeenCalledTimes(3);
  });
});
