export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

export interface SignInData {
  login: string;
  password: string;
}

/**
 * POST /api/v1/signup
 */
export async function signUp(data: SignUpData) {
  const res = await fetch('/api/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ user: data }),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.message || 'Signup failed');
  }
  return res.json();
}

/**
 * POST /api/v1/login
 */
export async function signIn(data: SignInData) {
  const res = await fetch('/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ user: data }),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.message || 'Signin failed');
  }
  return res.json();
}
