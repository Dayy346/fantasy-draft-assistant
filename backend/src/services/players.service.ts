import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlayers = async (position: string, sort: string, order: string, page: number, limit: number) => {
  const where: any = {};
  if (position) {
    where.position = position;
  }

  // Handle sorting by season fields
  let orderBy: any = {};
  if (sort) {
    // Comprehensive list of sortable fields
    const seasonFields = [
      'ppg', 'ppt', 'draftScore', 'vorp', 'oppg', 'ypc', 'ypr', 'tpg', 
      'ypa', 'pass_td_rate', 'int_rate', 'rushing_ppg_index', 'yprr', 'ypt', 'adot'
    ];
    
    if (seasonFields.includes(sort)) {
      // For season fields, we'll sort in memory after fetching
      orderBy = { name: 'asc' }; // Default sort, will be overridden
    } else {
      orderBy[sort] = order || 'desc';
    }
  }

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        seasons: {
          orderBy: { year: 'desc' },
          take: 1
        },
      },
    }),
    prisma.player.count({ where })
  ]);

  // If sorting by season fields, sort the results
  const seasonFields = [
    'ppg', 'ppt', 'draftScore', 'vorp', 'oppg', 'ypc', 'ypr', 'tpg', 
    'ypa', 'pass_td_rate', 'int_rate', 'rushing_ppg_index', 'yprr', 'ypt', 'adot'
  ];
  
  if (seasonFields.includes(sort)) {
    players.sort((a, b) => {
      const aValue = a.seasons[0]?.[sort] || 0;
      const bValue = b.seasons[0]?.[sort] || 0;
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  return {
    players,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getPlayerById = async (id: string) => {
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      seasons: {
        orderBy: { year: 'desc' }
      },
    },
  });

  return player;
};

export const searchPlayers = async (query: string, limit: number = 20) => {
  const players = await prisma.player.findMany({
    where: {
      name: {
        contains: query
      }
    },
    take: limit,
    include: {
      seasons: {
        orderBy: { year: 'desc' },
        take: 1
      }
    }
  });
  
  return { players, total: players.length };
};
