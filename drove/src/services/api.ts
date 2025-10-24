const API_BASE_URL = 'https://drove-backend-production.up.railway.app';

/* Permite usar todas las opciones de RequestInit + timeout en ms */
export interface RequestConfig extends RequestInit {
  timeout?: number;
}

class ApiService {
  private static refreshingPromise: Promise<boolean> | null = null;
  private static refreshTimerId: number | null = null;

  private static parseJwtExpMs(token?: string | null): number | null {
    if (!token) return null;
    try {
      const [, payloadB64] = token.split('.') as [string, string, string];
      const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
      const expSec = Number(json?.exp);
      if (!Number.isFinite(expSec)) return null;
      return expSec * 1000;
    } catch {
      return null;
    }
  }

  static scheduleProactiveRefresh(): void {
    try { if (this.refreshTimerId) { clearTimeout(this.refreshTimerId); this.refreshTimerId = null; } } catch {}
    const token = localStorage.getItem('auth_token');
    const expMs = this.parseJwtExpMs(token);
    if (!expMs) return; // no token o no exp → no programar

    const now = Date.now();
    const safetyMs = 5 * 60 * 1000; // refrescar 5 minutos antes de caducar
    const delay = Math.max(30_000, expMs - now - safetyMs); // mínimo 30s para evitar loops

    this.refreshTimerId = window.setTimeout(async () => {
      const ok = await this.refreshAccessToken();
      if (ok) {
        // Reprogramar con el nuevo token
        this.scheduleProactiveRefresh();
      } else {
        // No reintentar en bucle; el siguiente request tratará de refrescar
        try { if (this.refreshTimerId) { clearTimeout(this.refreshTimerId); this.refreshTimerId = null; } } catch {}
      }
    }, delay);
  }

  static cancelProactiveRefresh(): void {
    try { if (this.refreshTimerId) { clearTimeout(this.refreshTimerId); } } catch {}
    this.refreshTimerId = null;
  }

  private static async refreshAccessToken(): Promise<boolean> {
    // Deduplicate parallel refresh attempts
    if (this.refreshingPromise) return this.refreshingPromise;
    const doRefresh = async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return false;
        const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!resp.ok) return false;
        const data: any = await resp.json();
        const newAccess = data?.access_token;
        const newRefresh = data?.refresh_token;
        if (newAccess) localStorage.setItem('auth_token', newAccess);
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
        try { localStorage.setItem('last_login_at', new Date().toISOString()); } catch {}
        // Programar próximo refresh usando el nuevo token
        try { this.scheduleProactiveRefresh(); } catch {}
        return Boolean(newAccess);
      } catch {
        return false;
      } finally {
        this.refreshingPromise = null;
      }
    };
    this.refreshingPromise = doRefresh();
    return this.refreshingPromise;
  }
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
      const doFetch = async () => fetch(url, {
        ...fetchCfg,
        body,
        headers: this.buildHeaders(body, headers),
        signal: controller.signal,
      });

      let resp = await doFetch();

      // Intento de refresh automático si 401 (excepto login)
      if (resp.status === 401 && !url.endsWith('/auth/login')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Reintentar una (1) vez con el nuevo token
          resp = await doFetch();
        }
      }

      clearTimeout(idTimeout);

      /* auth aún caducado o sin permisos */
      if (resp.status === 401) {
        const isLoginEndpoint = url.endsWith('/auth/login');
        // En flujo de login inválido, no disparamos el logout global; dejamos que la vista maneje el error
        if (!isLoginEndpoint) {
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
        /* intenta extraer mensaje JSON o texto plano del backend (Nest) */
        let msg = `HTTP ${resp.status}: ${resp.statusText}`;
        try {
          const data = await resp.json();
          msg = data?.message || data?.error || msg;
          if (Array.isArray(data?.message)) msg = data.message.join('. ');
        } catch {
          try { msg = await resp.text(); } catch {}
        }
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
