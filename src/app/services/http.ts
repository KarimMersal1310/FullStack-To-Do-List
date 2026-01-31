import { formatApiError } from './apiError';

export class ApiError extends Error {
  status?: number;
  body?: unknown;

  constructor(message: string, opts?: { status?: number; body?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = opts?.status;
    this.body = opts?.body;
  }
}

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') || ct.includes('application/problem+json');
}

// Get API base URL from environment variable, fallback to empty string for development proxy
function getApiBaseUrl(): string {
  try {
    // @ts-ignore - Vite environment variables
    const apiUrl = import.meta.env?.VITE_API_BASE_URL || '';
    // Remove trailing slash if present
    return apiUrl ? apiUrl.replace(/\/$/, '') : '';
  } catch {
    return '';
  }
}
const API_BASE_URL = getApiBaseUrl();

// Log API base URL to help debug (in both dev and production)
if (typeof window !== 'undefined') {
  if (API_BASE_URL) {
    console.log('✅ API Base URL configured:', API_BASE_URL);
  } else {
    console.warn('⚠️ API Base URL not set. Using relative paths. Make sure VITE_API_BASE_URL is set in Vercel environment variables.');
  }
}

export type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
};

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  // Prepend API base URL if provided, otherwise use relative path (for dev proxy)
  // Ensure path starts with / if API_BASE_URL is set
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : path;

  // Log the full URL in development for debugging
  if (typeof window !== 'undefined') {
    // @ts-ignore - Vite environment variables
    if (import.meta.env?.DEV) {
      console.log('API Request:', fullUrl);
    }
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const body = isJsonResponse(res) ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const msg = formatApiError(body, `Request failed (${res.status})`);
    throw new ApiError(msg, { status: res.status, body });
  }

  return body as T;
}

