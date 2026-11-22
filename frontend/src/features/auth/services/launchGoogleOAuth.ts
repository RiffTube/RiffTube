const DEFAULTS = {
  dev: 'http://localhost:3000',
  prod: '', // same origin: Rails serves the built frontend
};

function backendBaseUrl(): string {
  const fromEnv = (
    import.meta.env.VITE_BACKEND_URL as string | undefined
  )?.trim();
  const fallback = import.meta.env.DEV ? DEFAULTS.dev : DEFAULTS.prod;
  return (fromEnv || fallback).replace(/\/+$/, '');
}

async function fetchCsrfToken(base: string): Promise<string> {
  const res = await fetch(`${base}/api/v1/auth/csrf`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`CSRF token request failed (${res.status})`);
  const { token } = (await res.json()) as { token: string };
  return token;
}

// OmniAuth only starts the OAuth flow from a POST carrying a CSRF token
// (protects against login CSRF), so submit a real form rather than redirecting.
export async function launchGoogleOAuth(mode: 'signin' | 'signup' = 'signin') {
  const base = backendBaseUrl();
  const qs = mode === 'signup' ? '?signup=true' : '';

  try {
    const token = await fetchCsrfToken(base);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${base}/auth/google_oauth2${qs}`;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'authenticity_token';
    input.value = token;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    console.error(err);
    window.location.assign('/auth/failure?message=csrf_unavailable');
  }
}
