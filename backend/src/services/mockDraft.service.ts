import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MockDraftSession {
  id: string;
  teams: MockDraftTeam[];
  currentPick: number;
  currentTeam: number;
  isSnake: boolean;
  totalRounds: number;
  picks: MockDraftPick[];
  availablePlayers: string[];
  isComplete: boolean;
  createdAt: string;
}

export interface MockDraftTeam {
  id: number;
  name: string;
  isHuman: boolean;
  strategy: 'BPA' | 'Needs' | 'Balanced' | 'Aggressive';
  roster: {
    QB: string[];
    RB: string[];
    WR: string[];
    TE: string[];
    K: string[];
    DEF: string[];
  };
  needs: {
    QB: number;
    RB: number;
    WR: number;
    TE: number;
    K: number;
    DEF: number;
  };
}

export interface MockDraftPick {
  id: string;
  pickNumber: number;
  teamId: number;
  playerId: string;
  player: any;
  round: number;
  timestamp: string;
}

export interface BotStrategy {
  name: string;
  description: string;
  weightBPA: number;
  weightNeeds: number;
  weightPosition: number;
}

const BOT_STRATEGIES: Record<string, BotStrategy> = {
  BPA: {
    name: 'Best Player Available',
    description: 'Always picks the highest rated player',
    weightBPA: 0.8,
    weightNeeds: 0.1,
    weightPosition: 0.1,
  },
  Needs: {
    name: 'Needs Based',
    description: 'Focuses on filling roster needs',
    weightBPA: 0.2,
    weightNeeds: 0.7,
    weightPosition: 0.1,
  },
  Balanced: {
    name: 'Balanced',
    description: 'Balances BPA with needs',
    weightBPA: 0.5,
    weightNeeds: 0.4,
    weightPosition: 0.1,
  },
  Aggressive: {
    name: 'Aggressive',
    description: 'Takes risks for high upside',
    weightBPA: 0.6,
    weightNeeds: 0.2,
    weightPosition: 0.2,
  },
};

// Mock draft sessions stored in memory
const mockDraftSessions = new Map<string, MockDraftSession>();

export function createMockDraftSession(
  numTeams: number,
  isSnake: boolean = true,
  totalRounds: number = 15
): MockDraftSession {
  const sessionId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const teams: MockDraftTeam[] = [];
  const strategies = Object.keys(BOT_STRATEGIES);
  
  for (let i = 0; i < numTeams; i++) {
    const isHuman = i === 0; // First team is always human
    const strategy = isHuman ? 'Balanced' : strategies[Math.floor(Math.random() * strategies.length)];
    
    teams.push({
      id: i + 1,
      name: isHuman ? 'Your Team' : `Bot Team ${i}`,
      isHuman,
      strategy: strategy as any,
      roster: {
        QB: [],
        RB: [],
        WR: [],
        TE: [],
        K: [],
        DEF: [],
      },
      needs: {
        QB: 1,
        RB: 2,
        WR: 3,
        TE: 1,
        K: 1,
        DEF: 1,
      },
    });
  }

  const session: MockDraftSession = {
    id: sessionId,
    teams,
    currentPick: 1,
    currentTeam: 1,
    isSnake,
    totalRounds,
    picks: [],
    availablePlayers: [],
    isComplete: false,
    createdAt: new Date().toISOString(),
  };

  mockDraftSessions.set(sessionId, session);
  return session;
}

export async function getMockDraftSession(sessionId: string): Promise<MockDraftSession | null> {
  return mockDraftSessions.get(sessionId) || null;
}

export async function makeMockDraftPick(
  sessionId: string,
  playerId: string,
  isHuman: boolean = true
): Promise<MockDraftSession | null> {
  const session = mockDraftSessions.get(sessionId);
  if (!session || session.isComplete) {
    return null;
  }

  const currentTeam = session.teams.find(t => t.id === session.currentTeam);
  if (!currentTeam) {
    return null;
  }

  // If it's not the human's turn and this is a human pick, return current session
  if (!isHuman && currentTeam.isHuman) {
    return session;
  }

  // If it's the human's turn and this is a bot pick, return current session
  if (isHuman && !currentTeam.isHuman) {
    return session;
  }

  // Get player data
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      seasons: {
        orderBy: { year: 'desc' },
        take: 1,
      },
    },
  });

  if (!player) {
    return null;
  }

  // Create the pick
  const pick: MockDraftPick = {
    id: `pick_${session.picks.length + 1}`,
    pickNumber: session.currentPick,
    teamId: session.currentTeam,
    playerId: player.id,
    player,
    round: Math.ceil(session.currentPick / session.teams.length),
    timestamp: new Date().toISOString(),
  };

  // Add pick to session
  session.picks.push(pick);

  // Update team roster
  const position = player.position.toLowerCase() as keyof typeof currentTeam.roster;
  if (position in currentTeam.roster) {
    currentTeam.roster[position].push(player.id);
    currentTeam.needs[position] = Math.max(0, currentTeam.needs[position] - 1);
  }

  // Remove player from available players
  session.availablePlayers = session.availablePlayers.filter(id => id !== playerId);

  // Move to next pick
  session.currentPick++;
  
  if (session.isSnake) {
    const round = Math.ceil(session.currentPick / session.teams.length);
    const isOddRound = round % 2 === 1;
    
    if (isOddRound) {
      session.currentTeam = session.currentTeam === session.teams.length ? 1 : session.currentTeam + 1;
    } else {
      session.currentTeam = session.currentTeam === 1 ? session.teams.length : session.currentTeam - 1;
    }
  } else {
    session.currentTeam = session.currentTeam === session.teams.length ? 1 : session.currentTeam + 1;
  }

  // Check if draft is complete
  if (session.currentPick > session.teams.length * session.totalRounds) {
    session.isComplete = true;
  }

  return session;
}

export async function getBotPick(sessionId: string): Promise<string | null> {
  const session = mockDraftSessions.get(sessionId);
  if (!session || session.isComplete) {
    return null;
  }

  const currentTeam = session.teams.find(t => t.id === session.currentTeam);
  if (!currentTeam || currentTeam.isHuman) {
    return null;
  }

  // Get available players
  const availablePlayers = await prisma.player.findMany({
    where: {
      id: {
        in: session.availablePlayers.length > 0 ? session.availablePlayers : undefined,
      },
    },
    include: {
      seasons: {
        orderBy: { year: 'desc' },
        take: 1,
      },
    },
  });

  if (availablePlayers.length === 0) {
    return null;
  }

  // Apply bot strategy
  const strategy = BOT_STRATEGIES[currentTeam.strategy];
  const scoredPlayers = availablePlayers.map(player => {
    const season = player.seasons[0];
    if (!season) return { player, score: 0 };

    let score = 0;
    
    // BPA component (draft score)
    if (season.draftScore) {
      score += season.draftScore * strategy.weightBPA;
    }

    // Needs component
    const position = player.position.toLowerCase() as keyof typeof currentTeam.needs;
    const need = currentTeam.needs[position] || 0;
    score += need * 10 * strategy.weightNeeds;

    // Position value component
    const positionValues = { qb: 1.0, rb: 0.9, wr: 0.8, te: 0.7, k: 0.3, def: 0.4 };
    score += (positionValues[position] || 0.5) * 5 * strategy.weightPosition;

    return { player, score };
  });

  // Sort by score and pick the best
  scoredPlayers.sort((a, b) => b.score - a.score);
  return scoredPlayers[0].player.id;
}

export async function startMockDraft(sessionId: string): Promise<MockDraftSession | null> {
  const session = mockDraftSessions.get(sessionId);
  if (!session) {
    return null;
  }

  // Load available players
  const players = await prisma.player.findMany({
    include: {
      seasons: {
        orderBy: { year: 'desc' },
        take: 1,
      },
    },
  });

  session.availablePlayers = players.map(p => p.id);
  
  return session;
}

export function getMockDraftSessions(): MockDraftSession[] {
  return Array.from(mockDraftSessions.values());
}

export function deleteMockDraftSession(sessionId: string): boolean {
  return mockDraftSessions.delete(sessionId);
}
