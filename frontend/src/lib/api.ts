import { PlayersResponse, Player, DraftSession, MetricsResponse, SearchResponse, MockDraftSession } from './types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Players API
  async getPlayers(params: {
    position?: string
    sort?: string
    order?: 'asc' | 'desc'
    page?: number
    limit?: number
  } = {}): Promise<PlayersResponse> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<PlayersResponse>(`/players?${searchParams.toString()}`)
  }

  async getPlayer(id: string): Promise<Player> {
    return this.request<Player>(`/players/${id}`)
  }

  async searchPlayers(query: string): Promise<SearchResponse> {
    return this.request<SearchResponse>(`/search?q=${encodeURIComponent(query)}`)
  }

  // Metrics API
  async getMetrics(): Promise<MetricsResponse[]> {
    return this.request<MetricsResponse[]>('/metrics')
  }

  // Draft API
  async createDraftSession(): Promise<{ sessionId: string }> {
    return this.request<{ sessionId: string }>('/draft/session', {
      method: 'POST',
    })
  }

  async getDraftSession(sessionId: string): Promise<DraftSession> {
    return this.request<DraftSession>(`/draft/${sessionId}/board`)
  }

  async makePick(sessionId: string, playerId: string, teamSlot?: string): Promise<DraftSession> {
    return this.request<DraftSession>(`/draft/${sessionId}/pick`, {
      method: 'POST',
      body: JSON.stringify({ playerId, teamSlot }),
    })
  }

  // Mock Draft API
  async createMockDraftSession(params: {
    numTeams?: number
    isSnake?: boolean
    totalRounds?: number
  } = {}): Promise<MockDraftSession> {
    return this.request<MockDraftSession>('/mock-draft/session', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getMockDraftSession(sessionId: string): Promise<MockDraftSession> {
    return this.request<MockDraftSession>(`/mock-draft/${sessionId}`)
  }

  async startMockDraft(sessionId: string): Promise<MockDraftSession> {
    return this.request<MockDraftSession>(`/mock-draft/${sessionId}/start`, {
      method: 'POST',
    })
  }

  async makeMockDraftPick(sessionId: string, playerId: string, isHuman: boolean = true): Promise<MockDraftSession> {
    return this.request<MockDraftSession>(`/mock-draft/${sessionId}/pick`, {
      method: 'POST',
      body: JSON.stringify({ playerId, isHuman }),
    })
  }

  async getBotPick(sessionId: string): Promise<{ playerId: string }> {
    return this.request<{ playerId: string }>(`/mock-draft/${sessionId}/bot-pick`)
  }

  // Health check
  async healthCheck(): Promise<{ ok: boolean; ts: string }> {
    return this.request<{ ok: boolean; ts: string }>('/health')
  }
}

export const api = new ApiClient()
