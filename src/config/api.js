const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const BUSINESS_NAME = import.meta.env.VITE_BUSINESS_NAME || null;

async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = {
    ...(options.headers || {}),
  };

  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && !headers['Content-Type']) {
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
