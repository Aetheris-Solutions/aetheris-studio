const siteKey = process.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

if (!/^0x[A-Za-z0-9_-]{20,}$/.test(siteKey)) {
  console.error(
    'Release build blocked: VITE_TURNSTILE_SITE_KEY must be provided as a valid public Turnstile site key.'
  );
  process.exit(1);
}

console.log('Release environment validated: public Turnstile site key is present.');
