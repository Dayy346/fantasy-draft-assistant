import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface RookieProjection {
  rookieScore: number
  projectedPpg: number
  confidence: 'high' | 'medium' | 'low'
}

export function computeDraftCapitalScore(draftRound: number, draftPick: number): number {
  if (!draftRound || !draftPick) return 0
  
  // Higher draft capital = higher score
  // Round 1 = 100, Round 2 = 80, Round 3 = 60, etc.
  const roundScore = Math.max(0, 100 - (draftRound - 1) * 20)
  
  // Within round, earlier picks are better
  const pickScore = Math.max(0, 20 - (draftPick - 1) * 0.5)
  
  return Math.min(100, roundScore + pickScore)
}

export function computeCollegeProductionScore(collegeYdsPg: number): number {
  if (!collegeYdsPg) return 0
  
  // Normalize college production (0-100 scale)
  // Assuming 100+ yards per game is excellent
  return Math.min(100, (collegeYdsPg / 100) * 100)
}

export function computeCombineScore(combineSpeed: number): number {
  if (!combineSpeed) return 0
  
  // Normalize combine speed (0-100 scale)
  // Assuming 4.4s 40-yard dash is excellent
  const normalizedSpeed = Math.max(0, (4.8 - combineSpeed) / 0.4) * 100
  return Math.min(100, normalizedSpeed)
}

export function computeRookieScore(
  draftRound: number,
  draftPick: number,
  collegeYdsPg: number,
  combineSpeed?: number
): RookieProjection {
  const draftCapitalScore = computeDraftCapitalScore(draftRound, draftPick)
  const collegeScore = computeCollegeProductionScore(collegeYdsPg)
  const combineScore = combineSpeed ? computeCombineScore(combineSpeed) : 50 // Default if no combine data
  
  // Weighted combination
  const weights = {
    draftCapital: 0.50,
    collegeProduction: 0.30,
    combine: 0.20
  }
  
  const rookieScore = (
    draftCapitalScore * weights.draftCapital +
    collegeScore * weights.collegeProduction +
    combineScore * weights.combine
  ) / 100 // Normalize to 0-1 scale
  
  // Project PPG based on position and rookie score
  const projectedPpg = projectRookiePpg(rookieScore)
  
  // Determine confidence based on data availability
  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (draftRound && collegeYdsPg && combineSpeed) {
    confidence = 'high'
  } else if (draftRound && collegeYdsPg) {
    confidence = 'medium'
  }
  
  return {
    rookieScore,
    projectedPpg,
    confidence
  }
}

function projectRookiePpg(rookieScore: number): number {
  // Simple linear projection based on historical rookie performance
  // This would be more sophisticated with actual historical data
  const basePpg = 8 // Base PPG for rookies
  const maxPpg = 20 // Maximum expected PPG for top rookies
  
  return basePpg + (rookieScore * (maxPpg - basePpg))
}

export async function updateRookieProjections(): Promise<void> {
  console.log('Updating rookie projections...')
  
  const rookies = await prisma.season.findMany({
    where: { isRookie: true },
    include: { Player: true }
  })
  
  for (const season of rookies) {
    const projection = computeRookieScore(
      season.draftRound || 0,
      season.draftPick || 0,
      season.collegeYdsPg || 0,
      season.combineSpeed || undefined
    )
    
    await prisma.season.update({
      where: { id: season.id },
      data: {
        rookieScore: projection.rookieScore,
        rookiePpgProj: projection.projectedPpg
      }
    })
  }
  
  console.log('Rookie projections updated successfully')
}
