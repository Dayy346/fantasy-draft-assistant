import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function searchPlayers(query: string, limit: number = 20) {
  if (!query || query.length < 2) {
    return { players: [], total: 0 }
  }

  const players = await prisma.player.findMany({
    where: {
      name: {
        contains: query
      }
    },
    include: {
      seasons: {
        orderBy: { year: 'desc' },
        take: 1
      }
    },
    take: limit,
    orderBy: {
      name: 'asc'
    }
  })

  return {
    players,
    total: players.length
  }
}
