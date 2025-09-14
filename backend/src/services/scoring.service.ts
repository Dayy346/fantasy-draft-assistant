import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Position-specific scoring weights and metrics
export const POSITION_CONFIG = {
  QB: {
    primaryMetric: 'ppg',
    weights: { ppg: 0.7, consistency: 0.2, injury: -0.1 },
    replacementBaseline: 12, // QB12
    positionValue: 1.0
  },
  RB: {
    primaryMetric: 'ppg',
    weights: { ppg: 0.5, ppt: 0.2, oppg: 0.15, ypc: 0.1, consistency: 0.05, injury: -0.1 },
    replacementBaseline: 30, // RB30
    positionValue: 0.9
  },
  WR: {
    primaryMetric: 'ppg',
    weights: { ppg: 0.5, ppt: 0.2, oppg: 0.15, ypr: 0.1, consistency: 0.05, injury: -0.1 },
    replacementBaseline: 36, // WR36
    positionValue: 0.8
  },
  TE: {
    primaryMetric: 'ppg',
    weights: { ppg: 0.6, ppt: 0.2, oppg: 0.1, ypr: 0.05, consistency: 0.05, injury: -0.1 },
    replacementBaseline: 12, // TE12
    positionValue: 0.7
  },
  K: {
    primaryMetric: 'ppg',
    weights: { ppg: 0.8, consistency: 0.1, injury: -0.1 },
    replacementBaseline: 5, // K12
    positionValue: 0.3
  },
  DEF: {
    primaryMetric: 'ppg',
    weights: { ppg: 0.8, consistency: 0.1, injury: -0.1 },
    replacementBaseline: 3, // DEF12
    positionValue: 0.4
  }
}

export interface PositionMetrics {
  position: string
  means: Record<string, number>
  stdDevs: Record<string, number>
  weights: Record<string, number>
}

export async function computePositionMetrics(): Promise<PositionMetrics[]> {
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
  const metrics = ['ppg', 'ppt', 'oppg', 'ypc', 'ypr', 'consistency']
  
  const results: PositionMetrics[] = []

  for (const position of positions) {
    const players = await prisma.player.findMany({
      where: { position },
      include: { seasons: true }
    })

    const positionData: Record<string, number[]> = {}
    
    // Initialize arrays for each metric
    metrics.forEach(metric => {
      positionData[metric] = []
    })

    // Collect data from all seasons
    players.forEach(player => {
      player.seasons.forEach(season => {
        if (season.ppg !== null && season.ppg !== undefined) positionData.ppg.push(season.ppg)
        if (season.ppt !== null && season.ppt !== undefined) positionData.ppt.push(season.ppt)
        if (season.oppg !== null && season.oppg !== undefined) positionData.oppg.push(season.oppg)
        if (season.ypc !== null && season.ypc !== undefined) positionData.ypc.push(season.ypc)
        if (season.ypr !== null && season.ypr !== undefined) positionData.ypr.push(season.ypr)
        if (season.consistency !== null && season.consistency !== undefined) positionData.consistency.push(season.consistency)
      })
    })

    // Calculate means and standard deviations
    const means: Record<string, number> = {}
    const stdDevs: Record<string, number> = {}

    metrics.forEach(metric => {
      const values = positionData[metric].filter(v => !isNaN(v) && isFinite(v))
      if (values.length > 0) {
        means[metric] = values.reduce((sum, val) => sum + val, 0) / values.length
        const variance = values.reduce((sum, val) => sum + Math.pow(val - means[metric], 2), 0) / values.length
        stdDevs[metric] = Math.sqrt(variance)
      } else {
        means[metric] = 0
        stdDevs[metric] = 1
      }
    })

    results.push({
      position,
      means,
      stdDevs,
      weights: POSITION_CONFIG[position as keyof typeof POSITION_CONFIG]?.weights || {}
    })
  }

  return results
}

export function computeZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

export function computeDraftScore(
  season: any,
  positionMetrics: PositionMetrics,
  position: string
): number {
  const config = POSITION_CONFIG[position as keyof typeof POSITION_CONFIG]
  if (!config) return 0

  const weights = config.weights
  const means = positionMetrics.means
  const stdDevs = positionMetrics.stdDevs
  
  let score = 0
  let totalWeight = 0

  // PPG component (primary metric for all positions)
  if (season.ppg !== null && season.ppg !== undefined && weights.ppg) {
    const zScore = computeZScore(season.ppg, means.ppg, stdDevs.ppg)
    score += weights.ppg * zScore
    totalWeight += weights.ppg
  }

  // PPT component (for skill positions)
  if (season.ppt !== null && season.ppt !== undefined && 'ppt' in weights && weights.ppt) {
    const zScore = computeZScore(season.ppt, means.ppt, stdDevs.ppt)
    score += weights.ppt * zScore
    totalWeight += weights.ppt
  }

  // Opportunities per game component (for skill positions)
  if (season.oppg !== null && season.oppg !== undefined && 'oppg' in weights && weights.oppg) {
    const zScore = computeZScore(season.oppg, means.oppg, stdDevs.oppg)
    score += weights.oppg * zScore
    totalWeight += weights.oppg
  }

  // Yards per carry component (RB only)
  if (season.ypc !== null && season.ypc !== undefined && 'ypc' in weights && weights.ypc) {
    const zScore = computeZScore(season.ypc, means.ypc, stdDevs.ypc)
    score += weights.ypc * zScore
    totalWeight += weights.ypc
  }

  // Yards per reception component (WR/TE only)
  if (season.ypr !== null && season.ypr !== undefined && 'ypr' in weights && weights.ypr) {
    const zScore = computeZScore(season.ypr, means.ypr, stdDevs.ypr)
    score += weights.ypr * zScore
    totalWeight += weights.ypr
  }

  // Consistency component
  if (season.consistency !== null && season.consistency !== undefined && weights.consistency) {
    const zScore = computeZScore(season.consistency, means.consistency, stdDevs.consistency)
    score += weights.consistency * zScore
    totalWeight += weights.consistency
  }

  // Injury risk component (negative weight)
  if (season.games !== null && season.games !== undefined && weights.injury) {
    const expectedGames = 17
    const injuryRisk = Math.max(0, (expectedGames - season.games) / expectedGames)
    score += weights.injury * injuryRisk
    totalWeight += Math.abs(weights.injury)
  }

  // Normalize by total weight
  const normalizedScore = totalWeight > 0 ? score / totalWeight : 0
  
  // Apply position value scaling to make scores comparable across positions
  return normalizedScore * config.positionValue
}

export function computeVORP(
  season: any,
  position: string,
  replacementBaselines: Record<string, number>
): number {
  const config = POSITION_CONFIG[position as keyof typeof POSITION_CONFIG]
  if (!config) return 0

  const baseline = config.replacementBaseline
  const projectedPpg = season.ppg || 0
  return projectedPpg - baseline
}

export async function updatePlayerScores(): Promise<void> {
  console.log('Computing position metrics...')
  const positionMetrics = await computePositionMetrics()
  
  console.log('Updating player scores...')
  const players = await prisma.player.findMany({
    include: { seasons: true }
  })

  for (const player of players) {
    const positionMetric = positionMetrics.find(pm => pm.position === player.position)
    if (!positionMetric) continue

    for (const season of player.seasons) {
      // Compute draft score with position scaling
      const draftScore = computeDraftScore(season, positionMetric, player.position)
      
      // Compute VORP
      const vorp = computeVORP(season, player.position, {})

      // Update season with computed values
      await prisma.season.update({
        where: { id: season.id },
        data: {
          draftScore,
          vorp
        }
      })
    }
  }

  console.log('Player scores updated successfully')
}
