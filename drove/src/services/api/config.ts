
// Configuración base para las APIs
export const API_BASE_URL = 'https://drove-back-production.up.railway.app';

export const withAuth = (options: RequestInit = {}): RequestInit => {
  const token = localStorage.getItem('auth_token');
  
  return {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};
