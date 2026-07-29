const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  get: async (endpoint: string) => {
    const url = API_URL ? `${API_URL}${endpoint}` : endpoint;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },
  
  post: async (endpoint: string, data?: any, token?: string) => {
    const url = API_URL ? `${API_URL}${endpoint}` : endpoint;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },
  
  put: async (endpoint: string, data?: any, token?: string) => {
    const url = API_URL ? `${API_URL}${endpoint}` : endpoint;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },
  
  delete: async (endpoint: string, token?: string) => {
    const url = API_URL ? `${API_URL}${endpoint}` : endpoint;
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },
};
