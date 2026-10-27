const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (window.location.port === '5173' || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
      return '/api/dashboard';
    }
    return `http://${hostname}:8000/api/dashboard`;
  }
  return '/api/dashboard';
};

export const BASE_URL = resolveBaseUrl();

export function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}
