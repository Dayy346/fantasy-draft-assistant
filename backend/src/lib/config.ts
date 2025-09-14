// backend/src/lib/config.ts
export const MIN_GAMES = 8; // ignore very small samples in z-scores

// Replacement levels for VORP/VBD (12-team leagues; tweak if needed)
export const REPLACEMENT_RANK = {
  RB: 24,  // 2 RBs per team
  WR: 24,  // 2 WRs per team  
  TE: 12,  // 1 TE per team
  QB: 12,  // 1 QB per team
} as const;

// Composite score weights by position.
// If a metric is missing for a player, renormalize remaining weights.
export const WEIGHTS = {
  RB: { ppg: 0.50, ppt: 0.25, oppg: 0.15, ypc: 0.10 },
  WR: { ppg: 0.45, tpg: 0.30, yprr_or_ypt: 0.15, ppt: 0.10 },
  TE: { ppg: 0.50, tpg: 0.30, yprr_or_ypt: 0.15, ppt: 0.05 },
  QB: { ppg: 0.50, pass_td_rate: 0.20, ypa: 0.15, rushing_ppg_index: 0.15 },
} as const;

// 3-year recency weights (y1 most recent) - More biased towards recent seasons
export const RECENCY = { y1: 0.8, y2: 0.15, y3: 0.05 };
