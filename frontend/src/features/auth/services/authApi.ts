export class ApiError extends Error {
  status?: number;
  /** Raw parsed response body (if any). Kept as unknown on purpose. */
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

export interface SignInData {
  /** Either email or username */
  login: string;
  password: string;
}

export type SignUpRequest = { user: SignUpData };
export type SignInRequest = { user: SignInData };

export interface UserDTO {
  id: string;
  username: string;
  email: string;
}

export interface ApiUserResponse {
  user: UserDTO;
}

export interface ErrorResponse {
  error?: string;
  message?: string;
}

function isJsonContent(res: Response): boolean {
  const ct = res.headers.get('content-type');
  return !!ct && ct.toLowerCase().includes('application/json');
}

function isErrorResponse(payload: unknown): payload is ErrorResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    ('error' in payload || 'message' in payload)
  );
}

/**
 * Parse the response as JSON if present, throw ApiError when not ok,
 * otherwise return the parsed payload as type T.
 */
async function handleJson<T>(res: Response): Promise<T> {
  let parsed: unknown = null;

  if (isJsonContent(res)) {
    // Read once: if body is empty, json() will throw, so guard with text().
    const text = await res.text();
    parsed = text.length > 0 ? (JSON.parse(text) as unknown) : null;
  }

  if (!res.ok) {
    const err = isErrorResponse(parsed) ? parsed : undefined;
    const msg =
      err?.error ?? err?.message ?? `Request failed with status ${res.status}`;
    throw new ApiError(msg, res.status, parsed);
  }

  // If success with no body, return an empty object cast to T.
  if (parsed === null || typeof parsed === 'undefined') {
    return {} as T;
  }

  return parsed as T;
}

/* ----------------------- API calls ----------------------- */

/** POST /api/v1/signup  (expects { user: { username, email, password } }) */
export async function signUp(data: SignUpData): Promise<ApiUserResponse> {
  const body: SignUpRequest = { user: data };

  const res = await fetch('/api/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  return handleJson<ApiUserResponse>(res);
}

/** POST /api/v1/login  (expects { user: { login, password } }) */
export async function signIn(data: SignInData): Promise<ApiUserResponse> {
  const body: SignInRequest = { user: data };

  const res = await fetch('/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  return handleJson<ApiUserResponse>(res);
}
