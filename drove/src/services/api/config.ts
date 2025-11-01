
// Configuración base para las APIs
export const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://drove-backend.up.railway.app';

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
