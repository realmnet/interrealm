import type { CreateRealmRequest, CreateRealmResponse, DatabaseRealm } from '@interrealm/types';

// TODO: Remove hardcoded key before production deployment
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-test-key-12345';
const CONTROL_PLANE_URL = import.meta.env.VITE_CONTROL_PLANE_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;
  private getApiKey: () => string | null;

  constructor(baseUrl: string = CONTROL_PLANE_URL, getApiKey: () => string | null = () => API_KEY) {
    this.baseUrl = baseUrl;
    this.getApiKey = getApiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createRealm(data: CreateRealmRequest): Promise<CreateRealmResponse> {
    return this.request<CreateRealmResponse>('/api/v1/realms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRealm(id: string): Promise<{ realm: DatabaseRealm }> {
    return this.request<{ realm: DatabaseRealm }>(`/api/v1/realms/${id}`);
  }

  async listRealms(clusterId?: string): Promise<{ realms: DatabaseRealm[] }> {
    const query = clusterId ? `?clusterId=${clusterId}` : '';
    return this.request<{ realms: DatabaseRealm[] }>(`/api/v1/realms${query}`);
  }

  async updateRealmStatus(id: string, status: 'pending' | 'running' | 'failed' | 'stopped'): Promise<{ realm: DatabaseRealm }> {
    return this.request<{ realm: DatabaseRealm }>(`/api/v1/realms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Create default instance
export const apiClient = new ApiClient();

// Hook for creating authenticated API client
export function useApiClient(apiKey: string | null): ApiClient {
  return new ApiClient(CONTROL_PLANE_URL, () => apiKey);
}