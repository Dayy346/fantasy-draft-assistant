// backend/src/etl/normalize.ts
type Num = number | null | undefined;

const toNum = (v: any): number => (v === null || v === undefined || v === "" ? 0 : Number(v));
const safeDiv = (num: Num, den: Num): number => {
  const n = toNum(num), d = toNum(den);
  return d === 0 ? 0 : n / d;
};
const round2 = (n: Num): number => Math.round(toNum(n) * 100) / 100;

export type Position = "RB" | "WR" | "TE" | "QB";

/**
 * FIELD MAPPING
 * Map your raw CSV headers to canonical keys here (adjust to your dataset).
 * - QB:  pass_att, pass_cmp, pass_yds, pass_td, ints, rush_att, rush_yds, rush_td, games, fpts
 * - RB:  att, tgt, rec, rush_yds, recv_yds, total_td, games, fpts
 * - WR/TE: tgt, rec, recv_yds, rec_td, rush_att?, rush_yds?, rush_td?, routes?, games, fpts, air_yds?
 */
export function mapRow(row: any, position: Position) {
  const base = {
    name: row.player || row.name,
    team: row.team || row.TEAM,
    year: Number(row.year || row.season),
    games: Number(row.games || row.g || row.G || 0),
    fpts: Number(row.fpts || row.fantasy_points || 0),
    position,
  };

  if (position === "QB") {
    return {
      ...base,
      pass_att: Number(row.pass_att || row.att || 0),
      pass_cmp: Number(row.pass_cmp || row.cmp || 0),
      pass_yds: Number(row.pass_yds || row.yds || 0),
      pass_td: Number(row.pass_td || row.td || 0),
      ints: Number(row.ints || row.int || 0),
      rush_att: Number(row.rush_att || row.ratt || 0),
      rush_yds: Number(row.rush_yds || row.ryds || 0),
      rush_td: Number(row.rush_td || row.rtd || 0),
    };
  }

  if (position === "RB") {
    return {
      ...base,
      att: Number(row.att || 0),
      tgt: Number(row.tgt || 0),
      rec: Number(row.rec || 0),
      rush_yds: Number(row.rush_yds || row.ryds || 0),
      recv_yds: Number(row.recv_yds || row.reyds || row.rec_yds || 0),
      total_td: Number(row.total_td || row.td || 0),
    };
  }

  // WR/TE share the same primary inputs
  return {
    ...base,
    tgt: Number(row.tgt || 0),
    rec: Number(row.rec || 0),
    recv_yds: Number(row.recv_yds || row.rec_yds || row.yds || 0),
    rec_td: Number(row.rec_td || row.td || 0),
    rush_att: Number(row.rush_att || 0),
    rush_yds: Number(row.rush_yds || 0),
    rush_td: Number(row.rush_td || 0),
    routes: Number(row.routes || 0),     // if available; else 0
    air_yds: Number(row.air_yds || 0),   // if available; else 0
  };
}

// Common derived
export function deriveCommon(row: any) {
  const games = toNum(row.games);
  const ppg = safeDiv(row.fpts, games);
  return { ppg: round2(ppg) };
}

// RB-specific derived
export function deriveRB(row: any) {
  const touches = toNum(row.att) + toNum(row.rec);
  const ppt = safeDiv(row.fpts, touches);
  const ypc = safeDiv(row.rush_yds, row.att);
  const oppg = safeDiv(toNum(row.att) + toNum(row.tgt), row.games);
  return {
    touches: toNum(touches),
    ppt: round2(ppt),
    ypc: round2(ypc),
    oppg: round2(oppg),
  };
}

// WR/TE derived
export function deriveReceiver(row: any) {
  const touches = toNum(row.rec) + toNum(row.rush_att);
  const ppt = safeDiv(row.fpts, touches);
  const ypt = safeDiv(row.recv_yds, row.tgt); // if routes missing, YPT is decent
  const yprr = row.routes ? safeDiv(row.recv_yds, row.routes) : 0;
  const tpg = safeDiv(row.tgt, row.games);
  const adot = row.air_yds ? safeDiv(row.air_yds, row.tgt) : 0;
  return {
    touches: toNum(touches),
    ppt: round2(ppt),
    ypt: round2(ypt),
    yprr: round2(yprr),
    tpg: round2(tpg),
    adot: round2(adot),
  };
}

// QB derived
export function deriveQB(row: any) {
  const ypa = safeDiv(row.pass_yds, row.pass_att);
  const pass_td_rate = safeDiv(row.pass_td, row.pass_att);
  const int_rate = safeDiv(row.ints, row.pass_att);
  const rush_ppg = safeDiv((toNum(row.rush_yds) / 10) + (toNum(row.rush_td) * 6), row.games); // fantasy rush points per game
  return {
    ypa: round2(ypa),
    pass_td_rate: round2(pass_td_rate),
    int_rate: round2(int_rate),
    rushing_ppg_index: round2(rush_ppg), // proxy for "dual-threat"
  };
}