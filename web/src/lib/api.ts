const API_BASE = '/api';

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('teleton_token', token);
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('teleton_token');
  }
  return authToken;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  async getStatus() {
    return fetchAPI<{ success: boolean; data: any }>('/status');
  },

  async getTools() {
    return fetchAPI<{ success: boolean; data: any[] }>('/tools');
  },

  async getMemoryStats() {
    return fetchAPI<{ success: boolean; data: any }>('/memory/stats');
  },

  async getSessions() {
    return fetchAPI<{ success: boolean; data: any[] }>('/memory/sessions');
  },

  async searchKnowledge(query: string, limit = 10) {
    return fetchAPI<{ success: boolean; data: any[] }>(`/memory/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  async getSoulFile(filename: string) {
    return fetchAPI<{ success: boolean; data: { content: string } }>(`/soul/${filename}`);
  },

  async updateSoulFile(filename: string, content: string) {
    return fetchAPI<{ success: boolean; data: { message: string } }>(`/soul/${filename}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  async getPlugins() {
    return fetchAPI<{ success: boolean; data: any[] }>('/plugins');
  },

  async updateToolConfig(
    toolName: string,
    config: { enabled?: boolean; scope?: 'always' | 'dm-only' | 'group-only' | 'admin-only' }
  ) {
    return fetchAPI<{ success: boolean; data: any }>(`/tools/${toolName}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  async getToolConfig(toolName: string) {
    return fetchAPI<{ success: boolean; data: any }>(`/tools/${toolName}/config`);
  },

  connectLogs(onLog: (entry: any) => void, onError?: (error: Event) => void) {
    const token = getAuthToken();
    const url = `${API_BASE}/logs/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    const eventSource = new EventSource(url);

    eventSource.addEventListener('log', (event) => {
      try {
        const entry = JSON.parse(event.data);
        onLog(entry);
      } catch (error) {
        console.error('Failed to parse log entry:', error);
      }
    });

    eventSource.onerror = (error) => {
      onError?.(error);
    };

    return () => eventSource.close();
  },
};
