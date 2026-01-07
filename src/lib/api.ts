// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://shared-clipboard-i8et.vercel.app';

export interface Card {
  id: number;
  clipboard_id: string;
  content: string;
  user_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Clipboard {
  id: string;
  created_at: string;
  updated_at: string;
  cards: Card[];
}

export interface CreateCardRequest {
  content: string;
  user_name?: string;
}

export interface UpdateCardRequest {
  content: string;
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

  async deleteClipboard(clipboardId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/clipboard/${clipboardId}`, {
      method: 'DELETE',
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Clipboard not found');
      }
      throw new Error('Failed to delete clipboard');
    }
  }

  async createCard(clipboardId: string, data: CreateCardRequest): Promise<Card> {
    const response = await fetch(`${this.baseUrl}/clipboard/${clipboardId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Clipboard not found');
      }
      throw new Error('Failed to create card');
    }

    return response.json();
  }

  async updateCard(cardId: number, data: UpdateCardRequest): Promise<Card> {
    const response = await fetch(`${this.baseUrl}/cards/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Card not found');
      }
      throw new Error('Failed to update card');
    }

    return response.json();
  }

  async deleteCard(cardId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/cards/${cardId}`, {
      method: 'DELETE',
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Card not found');
      }
      throw new Error('Failed to delete card');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { mode: 'cors' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const api = new ApiClient(API_BASE_URL);
