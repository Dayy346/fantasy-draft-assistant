import * as fs from 'fs';
import * as path from 'path';

const processedDataPath = path.resolve(__dirname, '../../../data/processed/2024_rb.json');
const normalizedDataPath = path.resolve(__dirname, '../../../data/processed/2024_rb_normalized.json');

const players = JSON.parse(fs.readFileSync(processedDataPath, 'utf-8'));

const normalizedPlayers = players.map((player: any) => {
  const att = parseInt(player.att) || 0;
  const rec = parseInt(player.rec) || 0;
  const rush_yds = parseInt(player.rush_yds.replace(/,/g, '')) || 0;
  const recv_yds = parseInt(player.recv_yds.replace(/,/g, '')) || 0;
  const fpts = parseFloat(player.fantasy_points) || 0;
  const games = parseInt(player.games) || 0;
  const tgt = parseInt(player.tgt) || 0;

  const touches = att + rec;
  const ppt = touches > 0 ? fpts / touches : 0;
  const ypc = att > 0 ? rush_yds / att : 0;
  const ypr = rec > 0 ? recv_yds / rec : 0;
  const tpg = games > 0 ? tgt / games : 0;
  const oppg = games > 0 ? (att + tgt) / games : 0;

  return {
    ...player,
    att,
    rec,
    rush_yds,
    recv_yds,
    fpts,
    games,
    tgt,
    touches,
    ppt,
    ypc,
    ypr,
    tpg,
    oppg,
  };
});

fs.writeFileSync(normalizedDataPath, JSON.stringify(normalizedPlayers, null, 2));

console.log('Successfully normalized 2024_rb.json');
