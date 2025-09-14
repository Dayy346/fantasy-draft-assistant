import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// In-memory storage for draft sessions (in production, this would be Redis or database)
const draftSessions = new Map<string, DraftSession>()

export interface DraftSession {
  id: string
  picks: DraftPick[]
  suggestions: any[]
  rosterNeeds: RosterNeeds
  createdAt: string
}

export interface DraftPick {
  id: string
  playerId: string
  player: any
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

const DEFAULT_ROSTER_NEEDS: RosterNeeds = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 1
}

export function createDraftSession(): { sessionId: string } {
  const sessionId = uuidv4()
  const session: DraftSession = {
    id: sessionId,
    picks: [],
    suggestions: [],
    rosterNeeds: { ...DEFAULT_ROSTER_NEEDS },
    createdAt: new Date().toISOString()
  }
  
  draftSessions.set(sessionId, session)
  return { sessionId }
}

export function getDraftSession(sessionId: string): DraftSession | null {
  return draftSessions.get(sessionId) || null
}

export async function makePick(
  sessionId: string, 
  playerId: string, 
  teamSlot?: string
): Promise<DraftSession | null> {
  const session = draftSessions.get(sessionId)
  if (!session) return null

  // Get player data
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      seasons: {
        orderBy: { year: 'desc' },
        take: 1
      }
    }
  })

  if (!player) return null

  // Create pick
  const pick: DraftPick = {
    id: uuidv4(),
    playerId,
    player,
    pickNumber: session.picks.length + 1,
    teamSlot,
    timestamp: new Date().toISOString()
  }

  // Add pick to session
  session.picks.push(pick)

  // Update roster needs
  const position = player.position as keyof RosterNeeds
  if (session.rosterNeeds[position] > 0) {
    session.rosterNeeds[position]--
  }

  // Update suggestions
  await updateSuggestions(session)

  draftSessions.set(sessionId, session)
  return session
}

async function updateSuggestions(session: DraftSession): Promise<void> {
  // Get all players not yet picked
  const pickedPlayerIds = session.picks.map(pick => pick.playerId)
  
  const availablePlayers = await prisma.player.findMany({
    where: {
      id: {
        notIn: pickedPlayerIds
      }
    },
    include: {
      seasons: {
        orderBy: { year: 'desc' },
        take: 1
      }
    }
  })

  // Sort by draft score and filter by roster needs
  const suggestions = availablePlayers
    .filter(player => {
      const position = player.position as keyof RosterNeeds
      return session.rosterNeeds[position] > 0
    })
    .sort((a, b) => {
      const aScore = a.seasons[0]?.draftScore || 0
      const bScore = b.seasons[0]?.draftScore || 0
      return bScore - aScore
    })
    .slice(0, 20) // Top 20 suggestions

  session.suggestions = suggestions
}

export function undoPick(sessionId: string, pickId: string): DraftSession | null {
  const session = draftSessions.get(sessionId)
  if (!session) return null

  const pickIndex = session.picks.findIndex(pick => pick.id === pickId)
  if (pickIndex === -1) return null

  const pick = session.picks[pickIndex]
  
  // Remove pick
  session.picks.splice(pickIndex, 1)

  // Update roster needs
  const position = pick.player.position as keyof RosterNeeds
  session.rosterNeeds[position]++

  // Update suggestions
  updateSuggestions(session)

  draftSessions.set(sessionId, session)
  return session
}
