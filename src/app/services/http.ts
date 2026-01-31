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
    const env = import.meta.env;
    // @ts-ignore
    let apiUrl = env?.VITE_API_BASE_URL;
    
    // If not set and we're in production (not localhost), use the default API URL
    if (!apiUrl && typeof window !== 'undefined') {
      // @ts-ignore
      const isProduction = env?.PROD || env?.MODE === 'production' || 
                          (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'));
      
      if (isProduction) {
        // Default production API URL
        apiUrl = 'http://karimtodolistapi.runasp.net';
        console.warn('⚠️ VITE_API_BASE_URL not set. Using default:', apiUrl);
        console.warn('⚠️ Please set VITE_API_BASE_URL in Vercel for proper configuration.');
      }
    }
    
    // Remove trailing slash if present
    return apiUrl ? String(apiUrl).replace(/\/$/, '') : '';
  } catch (e) {
    if (typeof window !== 'undefined') {
      console.error('Error reading API base URL:', e);
    }
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
    console.warn('⚠️ This means API calls will go to the current domain (Vercel) instead of the external API.');
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

  // Log the full URL for debugging (in both dev and production)
  if (typeof window !== 'undefined') {
    // @ts-ignore - Vite environment variables
    if (import.meta.env?.DEV) {
      console.log('🔵 API Request (dev):', fullUrl);
    } else {
      // Log in production too, but less verbose
      console.log('🌐 API Request:', fullUrl);
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

