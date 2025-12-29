const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

const LOCAL_DEFAULT_BASE_URL = normalizeBaseUrl('http://localhost:5000');
const PRODUCTION_DEFAULT_BASE_URL = normalizeBaseUrl('https://api.edusupernova.com');

const inferBaseUrl = () => {
  const envBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  const isEnvLocalhost = envBase && /localhost|127\.0\.0\.1/.test(envBase);

  if (typeof window !== 'undefined' && window.location) {
    const { origin, hostname } = window.location;
    const isBrowserLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (envBase && (!isEnvLocalhost || isBrowserLocalhost)) {
      return envBase;
    }

    if (isBrowserLocalhost) {
      return envBase || LOCAL_DEFAULT_BASE_URL;
    }

    return envBase || PRODUCTION_DEFAULT_BASE_URL || normalizeBaseUrl(origin);
  }

  if (import.meta.env.PROD) {
    return envBase || PRODUCTION_DEFAULT_BASE_URL || LOCAL_DEFAULT_BASE_URL;
  }

  return envBase || LOCAL_DEFAULT_BASE_URL;
};

const API_BASE_URL = inferBaseUrl();
const BUSINESS_NAME = import.meta.env.VITE_BUSINESS_NAME || null;

async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = {
    ...(options.headers || {}),
  };

  const method = (options.method || 'GET').toUpperCase();
  const isFormData =
    typeof FormData !== 'undefined' && options.body && options.body instanceof FormData;

  if (method !== 'GET' && method !== 'HEAD' && !headers['Content-Type'] && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  let payload;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
      (typeof payload === 'string' ? payload : 'Request failed');
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export { apiFetch, API_BASE_URL, BUSINESS_NAME };
