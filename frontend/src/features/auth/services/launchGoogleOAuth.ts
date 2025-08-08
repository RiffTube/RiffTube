const DEFAULTS = {
  dev: 'http://localhost:3000',
  prod: 'https://rifftube-backend.onrender.com',
};

function backendBaseUrl(): string {
  const fromEnv = (
    import.meta.env.VITE_BACKEND_URL as string | undefined
  )?.trim();
  const fallback = import.meta.env.DEV ? DEFAULTS.dev : DEFAULTS.prod;
  return (fromEnv || fallback).replace(/\/+$/, '');
}

export function launchGoogleOAuth(mode: 'signin' | 'signup' = 'signin') {
  const base = backendBaseUrl();
  const qs = mode === 'signup' ? '?signup=true' : '';
  window.location.assign(`${base}/api/v1/auth/google_oauth2${qs}`);
}
