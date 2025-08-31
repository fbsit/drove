const API_BASE_URL = 'https://drove-backend-production.up.railway.app';

/* Permite usar todas las opciones de RequestInit + timeout en ms */
export interface RequestConfig extends RequestInit {
  timeout?: number;
}

class ApiService {
  /* ────────────────────────── headers dinámicos ─────────────────────────── */
  private static buildHeaders(data?: any, extra: HeadersInit = {}): HeadersInit {
    const token = localStorage.getItem('auth_token') ?? '';

    /* Siempre aceptamos JSON */
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(extra as Record<string, string>),
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    /* Solo ponemos Content-Type JSON si el cuerpo NO es FormData */
    if (!(data instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  /* ─────────────────────────── núcleo request ───────────────────────────── */
  private static async request<T>(
    endpoint: string,
    { timeout = 30_000, body, headers = {}, ...fetchCfg }: RequestConfig & { body?: any } = {},
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    /* timeout */
    const controller = new AbortController();
    const idTimeout = setTimeout(() => controller.abort(), timeout);

    try {
      const resp = await fetch(url, {
        ...fetchCfg,
        body,
        headers: this.buildHeaders(body, headers),
        signal: controller.signal,
      });

      clearTimeout(idTimeout);

      /* auth caducado */
      if (resp.status === 401) {
        // Evitar redirección global cuando el 401 proviene del login (lo maneja la UI)
        const isLoginCall = url.endsWith('/auth/login');
        if (!isLoginCall) {
          try {
            const { dispatchUnauthorized } = await import('@/lib/authBus');
            dispatchUnauthorized();
          } catch {}
        }
        let msg = 'Unauthorized';
        try { msg = (await resp.json()).message ?? msg; } catch {}
        const err: any = new Error(msg);
        err.status = 401;
        throw err;
      } else if (resp.status === 403) {
        const data = await resp.json();
        const err: any = new Error(data.message);
        err.status = 403;
        throw err;
      }

      if (!resp.ok) {
        /* intenta extraer mensaje JSON */
        let msg = `HTTP ${resp.status}: ${resp.statusText}`;
        try { msg = (await resp.json()).message ?? msg; } catch { /* ignore */ }
        const err: any = new Error(msg);
        err.status = resp.status;
        throw err;
      }

      /* 204 - No Content  */
      if (resp.status === 204) return {} as T;

      /* Devuelve JSON si el servidor lo envía como tal */
      const contentType = resp.headers.get('content-type') ?? '';
      return contentType.includes('application/json')
        ? (await resp.json()) as T
        : ({} as T);
    } catch (err) {
      clearTimeout(idTimeout);
      if (err instanceof Error && err.name === 'AbortError') throw new Error('Request timeout');
      throw err;
    }
  }

  /* ───────────────────────────── helpers HTTP ───────────────────────────── */
  static get<T>(endpoint: string, cfg?: RequestConfig) {
    return this.request<T>(endpoint, { ...cfg, method: 'GET' });
  }

  static post<T>(
    endpoint: string,
    data?: any,
    cfg: RequestConfig = {},
  ) {
    const isFormData = data instanceof FormData;
    const body =
      data === undefined ? undefined : isFormData ? data : JSON.stringify(data);

    const headers = {
      //  Sólo agregamos Content-Type cuando NO es FormData
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...cfg.headers,
    };

    return this.request<T>(endpoint, {
      ...cfg,
      method: 'POST',
      body,
      headers,
    });
  }

  static put<T>(endpoint: string, data?: any, cfg?: RequestConfig) {
    const body = data instanceof FormData || data === undefined
      ? data
      : JSON.stringify(data);
    return this.request<T>(endpoint, { ...cfg, method: 'PUT', body });
  }

  static patch<T>(endpoint: string, data?: any, cfg?: RequestConfig) {
    const body = data instanceof FormData || data === undefined
      ? data
      : JSON.stringify(data);
    return this.request<T>(endpoint, { ...cfg, method: 'PATCH', body });
  }

  static delete<T>(endpoint: string, cfg?: RequestConfig) {
    return this.request<T>(endpoint, { ...cfg, method: 'DELETE' });
  }
}

export default ApiService;
