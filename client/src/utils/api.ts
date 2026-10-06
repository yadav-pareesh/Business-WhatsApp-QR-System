const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
let BASE_URL = '/api';
if (envApiUrl) {
  const clean = envApiUrl.replace(/\/+$/, '');
  BASE_URL = clean.endsWith('/api') ? clean : `${clean}/api`;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('bwqr_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http')
      ? endpoint
      : cleanEndpoint.startsWith('/api/')
        ? `${BASE_URL.replace(/\/api$/, '')}${cleanEndpoint}`
        : `${BASE_URL}${cleanEndpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Unable to communicate with the server. Please check your connection.' },
    }));

    if (!response.ok || !json.success) {
      const errorMsg = json.error?.message || json.message || 'Request failed';
      const err = new Error(errorMsg) as Error & { code?: string; details?: any };
      err.code = json.error?.code || 'UNKNOWN_ERROR';
      err.details = json.error?.details;
      throw err;
    }

    return json.data as T;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
