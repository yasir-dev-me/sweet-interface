// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://shared-clipboard-i8et.vercel.app';

export interface Clipboard {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  detail: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createClipboard(): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}/clipboard/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to create clipboard');
    }

    const data = await response.json();
    console.log('Create clipboard response:', data);
    return data;
  }

  async getClipboard(clipboardId: string): Promise<Clipboard> {
    console.log('Fetching clipboard:', clipboardId);
    const response = await fetch(`${this.baseUrl}/clipboard/${clipboardId}`, {
      mode: 'cors',
    });

    if (!response.ok) {
      console.error('Get clipboard failed:', response.status, response.statusText);
      if (response.status === 404) {
        throw new Error('Clipboard not found');
      }
      throw new Error('Failed to fetch clipboard');
    }

    const data = await response.json();
    console.log('Get clipboard response:', data);
    return data;
  }

  async updateClipboard(clipboardId: string, content: string): Promise<Clipboard> {
    const response = await fetch(`${this.baseUrl}/clipboard/${clipboardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Clipboard not found');
      }
      throw new Error('Failed to update clipboard');
    }

    return response.json();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const api = new ApiClient(API_BASE_URL);
