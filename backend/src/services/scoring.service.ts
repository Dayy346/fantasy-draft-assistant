import { PrismaClient } from '@prisma/client'
import { MIN_GAMES, RECENCY, WEIGHTS, REPLACEMENT_RANK } from '../lib/config'

const prisma = new PrismaClient()

type SeasonMetricRow = {
  player_id: string;
  name: string;
  position: "RB"|"WR"|"TE"|"QB";
  year: number;
  games: number;
  fpts: number;
  ppg: number;

  // RB
  ppt?: number; oppg?: number; ypc?: number;

  // WR/TE
  tpg?: number; yprr?: number; ypt?: number; adot?: number;

  // QB
  ypa?: number; pass_td_rate?: number; int_rate?: number; rushing_ppg_index?: number;

  // etc...
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const safe = (n?: number) => (Number.isFinite(n!) ? n! : 0);

function weighted3<T extends Record<string, number | undefined>>(
  y1: T|undefined, y2: T|undefined, y3: T|undefined
): T {
  // Renormalize weights if missing years.
  const has1 = !!y1, has2 = !!y2, has3 = !!y3;
  let w1 = has1 ? RECENCY.y1 : 0, w2 = has2 ? RECENCY.y2 : 0, w3 = has3 ? RECENCY.y3 : 0;
  const sum = w1 + w2 + w3 || 1;
  w1/=sum; w2/=sum; w3/=sum;

  const keys = new Set<string>([
    ...Object.keys(y1 || {}), ...Object.keys(y2 || {}), ...Object.keys(y3 || {})
  ]);

  const out: any = {};
  keys.forEach(k => {
    const v = safe(y1?.[k])*w1 + safe(y2?.[k])*w2 + safe(y3?.[k])*w3;
    out[k] = round2(v);
  });
  return out;
}

function meanStd(arr: number[]) {
  const xs = arr.filter(Number.isFinite);
  const n = xs.length || 1;
  const mean = xs.reduce((a,b)=>a+b,0)/n;
  const variance = xs.reduce((a,b)=>a+(b-mean)**2,0)/n;
  return { mean, std: Math.sqrt(variance) || 1e-9 };
}

function z(v: number, mean: number, std: number) { return (v - mean) / std; }

// Legacy position config for backward compatibility
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
    positionValue: 1.0
  },
  WR: {
    primaryMetric: 'ppg',
    weights: { ppg: 0.5, ppt: 0.2, oppg: 0.15, ypr: 0.1, consistency: 0.05, injury: -0.1 },
    replacementBaseline: 36, // WR36
    positionValue: 2.5
  },
  TE: {
    primaryMetric: 'ppg',
    weights: { ppg: 0.6, ppt: 0.2, oppg: 0.1, ypr: 0.05, consistency: 0.05, injury: -0.1 },
    replacementBaseline: 12, // TE12
    positionValue: 0.8
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

/**
 * Build per-position cohort stats and return enriched players with:
 * - weighted metrics
 * - z-scores
 * - draft_score
 * - vorp
 */
export function scorePlayers(mergedByPlayer: Record<string, SeasonMetricRow[]>) {
  // 1) compute weighted metrics per player from last 3 seasons
  type Summary = SeasonMetricRow & {
    // weighted
    ppg_w?: number; ppt_w?: number; oppg_w?: number; ypc_w?: number;
    tpg_w?: number; yprr_w?: number; ypt_w?: number; adot_w?: number;
    ypa_w?: number; pass_td_rate_w?: number; int_rate_w?: number; rushing_ppg_index_w?: number;

    // z-scores
    z: Record<string, number>;
    draft_score?: number;
    vorp?: number;
  };

  const summaries: Summary[] = [];

  for (const [player_id, seasons] of Object.entries(mergedByPlayer)) {
    // keep only seasons with games
    const ss = seasons.sort((a,b)=>b.year-a.year).filter(s=>s.games>=1);
    const [y1,y2,y3] = [ss[0], ss[1], ss[2]];
    if (!y1) continue;

    const position = y1.position;
    const base: Summary = {
      ...y1, player_id, z: {},
    };

    // collect metrics that may exist
    const pick = (s?: SeasonMetricRow) => s ? {
      ppg: s.ppg, ppt: s.ppt, oppg: s.oppg, ypc: s.ypc,
      tpg: s.tpg, yprr: s.yprr, ypt: s.ypt, adot: s.adot,
      ypa: s.ypa, pass_td_rate: s.pass_td_rate, int_rate: s.int_rate, rushing_ppg_index: s.rushing_ppg_index
    } : undefined;

    const w = weighted3(pick(y1), pick(y2), pick(y3));
    base.ppg_w = w.ppg;
    base.ppt_w = w.ppt;
    base.oppg_w = w.oppg;
    base.ypc_w = w.ypc;
    base.tpg_w = w.tpg;
    base.yprr_w = w.yprr;
    base.ypt_w = w.ypt;
    base.adot_w = w.adot;
    base.ypa_w = w.ypa;
    base.pass_td_rate_w = w.pass_td_rate;
    base.int_rate_w = w.int_rate;
    base.rushing_ppg_index_w = w.rushing_ppg_index;

    summaries.push(base);
  }

  // 2) build cohort stats per position for the relevant weighted metrics
  const byPos: Record<string, Summary[]> = { RB: [], WR: [], TE: [], QB: [] } as any;
  summaries.forEach(s => { if (byPos[s.position]) byPos[s.position].push(s); });

  // Helper: compute z for a metric key among players with >= MIN_GAMES in y1
  function zFor(pos: keyof typeof byPos, key: keyof Summary) {
    const cohort = byPos[pos].filter(p => p.games >= MIN_GAMES && Number.isFinite(p[key] as any));
    const arr = cohort.map(p => Number(p[key] ?? 0));
    const { mean, std } = meanStd(arr);
    byPos[pos].forEach(p => {
      const val = Number(p[key] ?? 0);
      p.z[key as string] = z(val, mean, std);
    });
  }

  // RB z
  zFor("RB", "ppg_w"); zFor("RB", "ppt_w"); zFor("RB", "oppg_w"); zFor("RB", "ypc_w");
  // WR z
  zFor("WR", "ppg_w"); zFor("WR", "tpg_w"); zFor("WR", "yprr_w"); zFor("WR", "ypt_w"); zFor("WR", "adot_w");
  // TE z
  zFor("TE", "ppg_w"); zFor("TE", "tpg_w"); zFor("TE", "yprr_w"); zFor("TE", "ypt_w"); zFor("TE", "ppt_w");
  // QB z
  zFor("QB", "ppg_w"); zFor("QB", "pass_td_rate_w"); zFor("QB", "ypa_w"); zFor("QB", "rushing_ppg_index_w"); zFor("QB", "int_rate_w");

  // 3) draft score per position using WEIGHTS (renormalize if missing)
  function combine(pos: keyof typeof WEIGHTS, p: Summary) {
    const cfg = WEIGHTS[pos];
    const parts: { w: number; v: number }[] = [];

    const push = (k: string, v: number|undefined) => {
      if (v === undefined || !Number.isFinite(v)) return;
      const weight = (cfg as any)[k];
      if (weight !== undefined) {
        parts.push({ w: weight, v });
      }
    };

    if (pos === "RB") {
      push("ppg", p.z["ppg_w"]); 
      if (p.z["ppt_w"] !== undefined) push("ppt", p.z["ppt_w"]);
      if (p.z["oppg_w"] !== undefined) push("oppg", p.z["oppg_w"]); 
      if (p.z["ypc_w"] !== undefined) push("ypc", p.z["ypc_w"]);
      // injury/consistency omitted here unless you compute them; else renormalize
    } else if (pos === "WR") {
      push("ppg", p.z["ppg_w"]); 
      if (p.z["tpg_w"] !== undefined) push("tpg", p.z["tpg_w"]);
      if (p.z["yprr_w"] !== undefined || p.z["ypt_w"] !== undefined) {
        push("yprr_or_ypt", Number.isFinite(p.z["yprr_w"]) ? p.z["yprr_w"] : p.z["ypt_w"]);
      }
      if (p.z["ppt_w"] !== undefined) push("ppt", p.z["ppt_w"]); 
      if (p.z["adot_w"] !== undefined) push("adot", p.z["adot_w"]);
    } else if (pos === "TE") {
      push("ppg", p.z["ppg_w"]); 
      if (p.z["tpg_w"] !== undefined) push("tpg", p.z["tpg_w"]);
      if (p.z["yprr_w"] !== undefined || p.z["ypt_w"] !== undefined) {
        push("yprr_or_ypt", Number.isFinite(p.z["yprr_w"]) ? p.z["yprr_w"] : p.z["ypt_w"]);
      }
      if (p.z["ppt_w"] !== undefined) push("ppt", p.z["ppt_w"]);
    } else if (pos === "QB") {
      push("ppg", p.z["ppg_w"]); 
      if (p.z["pass_td_rate_w"] !== undefined) push("pass_td_rate", p.z["pass_td_rate_w"]);
      if (p.z["ypa_w"] !== undefined) push("ypa", p.z["ypa_w"]); 
      if (p.z["rushing_ppg_index_w"] !== undefined) push("rushing_ppg_index", p.z["rushing_ppg_index_w"]);
      if (p.z["int_rate_w"] !== undefined) push("int_rate", p.z["int_rate_w"]); // negative weight already in config
    }

    const sumW = parts.reduce((a,b)=>a+Math.abs(b.w), 0) || 1;
    const score = parts.reduce((a,b)=> a + (b.v * b.w), 0) / sumW; // renormalize
    
    // Add baseline score to ensure positive scores for all players
    const baselineScore = 1.0;
    return round2(score + baselineScore);
  }

  summaries.forEach(p => {
    p.draft_score = combine(p.position as any, p);
  });

  // 4) VORP: replacement = Nth ranked by ppg_w (or draft_score; choose ppg_w here)
  (["RB","WR","TE","QB"] as const).forEach(pos => {
    const cohort = byPos[pos].slice().sort((a,b)=> (b.ppg_w||0) - (a.ppg_w||0));
    const idx = Math.min(REPLACEMENT_RANK[pos]-1, cohort.length-1);
    const replacement = cohort[idx]?.ppg_w ?? 0;

    byPos[pos].forEach(p => { p.vorp = round2((p.ppg_w || 0) - replacement); });
  });

  return summaries;
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
  if (season.ppg !== null && season.ppg !== undefined && season.ppg > 0 && weights.ppg) {
    const zScore = computeZScore(season.ppg, means.ppg, stdDevs.ppg)
    score += weights.ppg * zScore
    totalWeight += weights.ppg
  }

  // PPT component (for skill positions)
  if (season.ppt !== null && season.ppt !== undefined && season.ppt > 0 && 'ppt' in weights && weights.ppt) {
    const zScore = computeZScore(season.ppt, means.ppt, stdDevs.ppt)
    score += weights.ppt * zScore
    totalWeight += weights.ppt
  }

  // Opportunities per game component (for skill positions)
  if (season.oppg !== null && season.oppg !== undefined && season.oppg > 0 && 'oppg' in weights && weights.oppg) {
    const zScore = computeZScore(season.oppg, means.oppg, stdDevs.oppg)
    score += weights.oppg * zScore
    totalWeight += weights.oppg
  }

  // Yards per carry component (RB only)
  if (season.ypc !== null && season.ypc !== undefined && season.ypc > 0 && 'ypc' in weights && weights.ypc) {
    const zScore = computeZScore(season.ypc, means.ypc, stdDevs.ypc)
    score += weights.ypc * zScore
    totalWeight += weights.ypc
  }

  // Yards per reception component (WR/TE only)
  if (season.ypr !== null && season.ypr !== undefined && season.ypr > 0 && 'ypr' in weights && weights.ypr) {
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

  // If no valid metrics, return a basic score based on PPG
  if (totalWeight === 0 && season.ppg > 0) {
    const zScore = computeZScore(season.ppg, means.ppg, stdDevs.ppg)
    return zScore * config.positionValue
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
