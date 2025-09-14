export interface Player {
  id: string
  name: string
  position: 'QB' | 'RB' | 'WR' | 'TE'
  team?: string
  createdAt: string
  updatedAt: string
  seasons: Season[]
}

export interface Season {
  id: string
  playerId: string
  year: number
  games: number
  att?: number
  tgt?: number
  rec?: number
  rushYds?: number
  recvYds?: number
  totalTd?: number
  fpts?: number
  ppg?: number
  touches?: number
  ppt?: number
  ypc?: number
  ypr?: number
  tpg?: number
  oppg?: number
  consistency?: number
  snapShare?: number
  
  // Computed metrics
  ppgWeighted?: number
  pptWeighted?: number
  oppgWeighted?: number
  ypcWeighted?: number
  draftScore?: number
  vorp?: number
  
  // Rookie info
  isRookie?: boolean
  draftRound?: number
  draftPick?: number
  collegeYdsPg?: number
  combineSpeed?: number
  rookieScore?: number
  rookiePpgProj?: number
}

export interface PlayersResponse {
  players: Player[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DraftSession {
  id: string
  picks: DraftPick[]
  suggestions: Player[]
  rosterNeeds: RosterNeeds
}

export interface DraftPick {
  id: string
  playerId: string
  player: Player
  pickNumber: number
  teamSlot?: string
  timestamp: string
}

export interface RosterNeeds {
  QB: number
  RB: number
  WR: number
  TE: number
}

export interface MetricsResponse {
  position: string
  means: Record<string, number>
  stdDevs: Record<string, number>
  weights: Record<string, number>
}

export interface SearchResponse {
  players: Player[]
  total: number
}

// Mock Draft Types
export interface MockDraftSession {
  id: string
  teams: MockDraftTeam[]
  currentPick: number
  currentTeam: number
  isSnake: boolean
  totalRounds: number
  picks: MockDraftPick[]
  availablePlayers: string[]
  isComplete: boolean
  createdAt: string
}

export interface MockDraftTeam {
  id: number
  name: string
  isHuman: boolean
  strategy: 'BPA' | 'Needs' | 'Balanced' | 'Aggressive'
  roster: {
    QB: string[]
    RB: string[]
    WR: string[]
    TE: string[]
    K: string[]
    DEF: string[]
  }
  needs: {
    QB: number
    RB: number
    WR: number
    TE: number
    K: number
    DEF: number
  }
}

export interface MockDraftPick {
  id: string
  pickNumber: number
  teamId: number
  playerId: string
  player: Player
  round: number
  timestamp: string
}
