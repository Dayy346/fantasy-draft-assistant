import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { updatePlayerScores } from '../services/scoring.service';
import { updateRookieProjections } from '../services/rookies.service';
import { mapRow, deriveCommon, deriveRB, deriveReceiver, deriveQB } from '../etl/normalize';
import { scorePlayers } from '../services/scoring.service';

const prisma = new PrismaClient();

function generatePlayerId(name: string, position: string): string {
  // Create a stable player ID from name and position
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPosition = position.toLowerCase();
  return `${cleanName}_${cleanPosition}`;
}

// Comprehensive player data for all positions
const mockPlayers = {
  QB: [
    { name: "Josh Allen", team: "BUF", ppg: 24.5, fpts: 416.5, games: 17, att: 541, passYds: 4306, passTd: 29, ints: 18, rushYds: 524, rushTd: 15 },
    { name: "Lamar Jackson", team: "BAL", ppg: 23.8, fpts: 404.6, games: 17, att: 457, passYds: 3678, passTd: 24, ints: 7, rushYds: 821, rushTd: 5 },
    { name: "Dak Prescott", team: "DAL", ppg: 22.1, fpts: 375.7, games: 17, att: 475, passYds: 4516, passTd: 36, ints: 9, rushYds: 105, rushTd: 2 },
    { name: "Jalen Hurts", team: "PHI", ppg: 21.9, fpts: 372.3, games: 17, att: 428, passYds: 3858, passTd: 23, ints: 15, rushYds: 605, rushTd: 15 },
    { name: "Tua Tagovailoa", team: "MIA", ppg: 21.2, fpts: 360.4, games: 17, att: 388, passYds: 4624, passTd: 29, ints: 11, rushYds: 74, rushTd: 0 },
    { name: "C.J. Stroud", team: "HOU", ppg: 20.8, fpts: 353.6, games: 17, att: 499, passYds: 4108, passTd: 23, ints: 5, rushYds: 167, rushTd: 3 },
    { name: "Brock Purdy", team: "SF", ppg: 20.1, fpts: 341.7, games: 17, att: 444, passYds: 4280, passTd: 31, ints: 11, rushYds: 144, rushTd: 2 },
    { name: "Patrick Mahomes", team: "KC", ppg: 19.8, fpts: 336.6, games: 17, att: 566, passYds: 4183, passTd: 27, ints: 14, rushYds: 389, rushTd: 4 },
    { name: "Justin Herbert", team: "LAC", ppg: 19.5, fpts: 331.5, games: 17, att: 522, passYds: 4733, passTd: 25, ints: 10, rushYds: 228, rushTd: 3 },
    { name: "Joe Burrow", team: "CIN", ppg: 19.2, fpts: 326.4, games: 17, att: 365, passYds: 2309, passTd: 15, ints: 6, rushYds: 79, rushTd: 0 },
    { name: "Anthony Richardson", team: "IND", ppg: 18.9, fpts: 321.3, games: 17 },
    { name: "Trevor Lawrence", team: "JAX", ppg: 18.6, fpts: 316.2, games: 17 },
    { name: "Jordan Love", team: "GB", ppg: 18.3, fpts: 311.1, games: 17 },
    { name: "Geno Smith", team: "SEA", ppg: 18.0, fpts: 306.0, games: 17 },
    { name: "Kirk Cousins", team: "ATL", ppg: 17.7, fpts: 300.9, games: 17 },
    { name: "Kyler Murray", team: "ARI", ppg: 17.4, fpts: 295.8, games: 17 },
    { name: "Russell Wilson", team: "PIT", ppg: 17.1, fpts: 290.7, games: 17 },
    { name: "Baker Mayfield", team: "TB", ppg: 16.8, fpts: 285.6, games: 17 },
    { name: "Jared Goff", team: "DET", ppg: 16.5, fpts: 280.5, games: 17 },
    { name: "Derek Carr", team: "NO", ppg: 16.2, fpts: 275.4, games: 17 },
    { name: "Deshaun Watson", team: "CLE", ppg: 15.9, fpts: 270.3, games: 17 },
    { name: "Carson Wentz", team: "KC", ppg: 15.6, fpts: 265.2, games: 17 },
    { name: "Daniel Jones", team: "NYG", ppg: 15.3, fpts: 260.1, games: 17 },
    { name: "Sam Howell", team: "WAS", ppg: 15.0, fpts: 255.0, games: 17 },
    { name: "Bryce Young", team: "CAR", ppg: 14.7, fpts: 249.9, games: 17 },
    { name: "Will Levis", team: "TEN", ppg: 14.4, fpts: 244.8, games: 17 },
    { name: "Mac Jones", team: "NE", ppg: 14.1, fpts: 239.7, games: 17 },
    { name: "Aidan O'Connell", team: "LV", ppg: 13.8, fpts: 234.6, games: 17 },
    { name: "Zach Wilson", team: "NYJ", ppg: 13.5, fpts: 229.5, games: 17 },
    { name: "Ryan Tannehill", team: "TEN", ppg: 13.2, fpts: 224.4, games: 17 }
  ],
  WR: [
    { name: "Tyreek Hill", team: "MIA", ppg: 18.2, fpts: 309.4, games: 17, rec: 119, recvYds: 1799, tgt: 171, recTd: 13, routes: 600, airYds: 1200 },
    { name: "CeeDee Lamb", team: "DAL", ppg: 17.8, fpts: 302.6, games: 17, rec: 135, recvYds: 1749, tgt: 181, recTd: 12, routes: 650, airYds: 1100 },
    { name: "Amon-Ra St. Brown", team: "DET", ppg: 17.1, fpts: 290.7, games: 17, rec: 119, recvYds: 1515, tgt: 164, recTd: 10, routes: 580, airYds: 900 },
    { name: "Mike Evans", team: "TB", ppg: 16.8, fpts: 285.6, games: 17, rec: 79, recvYds: 1255, tgt: 136, recTd: 13, routes: 500, airYds: 1000 },
    { name: "A.J. Brown", team: "PHI", ppg: 16.5, fpts: 280.5, games: 17, rec: 106, recvYds: 1496, tgt: 146, recTd: 11, routes: 520, airYds: 950 },
    { name: "Stefon Diggs", team: "BUF", ppg: 16.2, fpts: 275.4, games: 17, rec: 107, recvYds: 1183, tgt: 160, recTd: 8, routes: 580, airYds: 750 },
    { name: "Davante Adams", team: "LV", ppg: 15.9, fpts: 270.3, games: 17, rec: 103, recvYds: 1144, tgt: 175, recTd: 8, routes: 620, airYds: 800 },
    { name: "Keenan Allen", team: "LAC", ppg: 15.6, fpts: 265.2, games: 17, rec: 108, recvYds: 1243, tgt: 150, recTd: 7, routes: 400, airYds: 700 },
    { name: "Puka Nacua", team: "LAR", ppg: 15.3, fpts: 260.1, games: 17, rec: 105, recvYds: 1486, tgt: 160, recTd: 6, routes: 550, airYds: 850 },
    { name: "Ja'Marr Chase", team: "CIN", ppg: 18.5, fpts: 314.5, games: 17, rec: 120, recvYds: 1500, tgt: 180, recTd: 12, routes: 600, airYds: 1200 },
    { name: "Cooper Kupp", team: "LAR", ppg: 14.7, fpts: 249.9, games: 17, rec: 95, recvYds: 1135, tgt: 130 },
    { name: "DeVonta Smith", team: "PHI", ppg: 14.4, fpts: 244.8, games: 17, rec: 81, recvYds: 1066, tgt: 106 },
    { name: "DK Metcalf", team: "SEA", ppg: 14.1, fpts: 239.7, games: 17, rec: 66, recvYds: 1114, tgt: 95 },
    { name: "Terry McLaurin", team: "WAS", ppg: 13.8, fpts: 234.6, games: 17, rec: 79, recvYds: 1002, tgt: 119 },
    { name: "DeAndre Hopkins", team: "TEN", ppg: 13.5, fpts: 229.5, games: 17, rec: 75, recvYds: 1057, tgt: 137 },
    { name: "Calvin Ridley", team: "TEN", ppg: 13.2, fpts: 224.4, games: 17, rec: 76, recvYds: 1016, tgt: 136 },
    { name: "DJ Moore", team: "CHI", ppg: 12.9, fpts: 219.3, games: 17, rec: 96, recvYds: 1364, tgt: 150 },
    { name: "Chris Olave", team: "NO", ppg: 12.6, fpts: 214.2, games: 17, rec: 87, recvYds: 1123, tgt: 138 },
    { name: "Garrett Wilson", team: "NYJ", ppg: 12.3, fpts: 209.1, games: 17, rec: 95, recvYds: 1042, tgt: 168 },
    { name: "Jaylen Waddle", team: "MIA", ppg: 12.0, fpts: 204.0, games: 17, rec: 72, recvYds: 1014, tgt: 104 },
    { name: "Tyler Lockett", team: "SEA", ppg: 11.7, fpts: 198.9, games: 17, rec: 79, recvYds: 894, tgt: 95 },
    { name: "Amari Cooper", team: "CLE", ppg: 11.4, fpts: 193.8, games: 17, rec: 72, recvYds: 1250, tgt: 72 },
    { name: "Brandon Aiyuk", team: "SF", ppg: 11.1, fpts: 188.7, games: 17, rec: 75, recvYds: 1342, tgt: 105 },
    { name: "Tee Higgins", team: "CIN", ppg: 10.8, fpts: 183.6, games: 17, rec: 42, recvYds: 656, tgt: 76 },
    { name: "Marquise Brown", team: "KC", ppg: 10.5, fpts: 178.5, games: 17, rec: 51, recvYds: 574, tgt: 106 },
    { name: "Courtland Sutton", team: "DEN", ppg: 10.2, fpts: 173.4, games: 17, rec: 59, recvYds: 772, tgt: 85 },
    { name: "Tyler Boyd", team: "CIN", ppg: 9.9, fpts: 168.3, games: 17, rec: 67, recvYds: 667, tgt: 98 },
    { name: "Diontae Johnson", team: "CAR", ppg: 9.6, fpts: 163.2, games: 17, rec: 51, recvYds: 617, tgt: 87 },
    { name: "Jerry Jeudy", team: "CLE", ppg: 9.3, fpts: 158.1, games: 17, rec: 54, recvYds: 758, tgt: 108 },
    { name: "Zay Flowers", team: "BAL", ppg: 9.0, fpts: 153.0, games: 17, rec: 77, recvYds: 858, tgt: 108 }
  ],
  TE: [
    { name: "Travis Kelce", team: "KC", ppg: 14.2, fpts: 241.4, games: 17, rec: 93, recvYds: 1338, tgt: 121, recTd: 10, routes: 450, airYds: 800 },
    { name: "Sam LaPorta", team: "DET", ppg: 13.8, fpts: 234.6, games: 17, rec: 86, recvYds: 889, tgt: 120, recTd: 10, routes: 420, airYds: 600 },
    { name: "Jake Ferguson", team: "DAL", ppg: 13.5, fpts: 229.5, games: 17, rec: 71, recvYds: 761, tgt: 102, recTd: 5, routes: 380, airYds: 500 },
    { name: "Evan Engram", team: "JAC", ppg: 13.2, fpts: 224.4, games: 17, rec: 114, recvYds: 963, tgt: 143, recTd: 4, routes: 500, airYds: 600 },
    { name: "Trey McBride", team: "ARI", ppg: 12.9, fpts: 219.3, games: 17, rec: 81, recvYds: 825, tgt: 106, recTd: 3, routes: 400, airYds: 550 },
    { name: "George Kittle", team: "SF", ppg: 12.6, fpts: 214.2, games: 17, rec: 65, recvYds: 1020, tgt: 90, recTd: 6, routes: 350, airYds: 700 },
    { name: "Mark Andrews", team: "BAL", ppg: 12.3, fpts: 209.1, games: 17, rec: 45, recvYds: 544, tgt: 61, recTd: 6, routes: 300, airYds: 400 },
    { name: "Kyle Pitts", team: "ATL", ppg: 12.0, fpts: 204.0, games: 17, rec: 53, recvYds: 667, tgt: 106, recTd: 3, routes: 400, airYds: 500 },
    { name: "David Njoku", team: "CLE", ppg: 11.7, fpts: 198.9, games: 17, rec: 88, recvYds: 882, tgt: 123, recTd: 6, routes: 450, airYds: 600 },
    { name: "Dallas Goedert", team: "PHI", ppg: 11.4, fpts: 193.8, games: 17, rec: 59, recvYds: 592, tgt: 76, recTd: 3, routes: 350, airYds: 400 },
    { name: "Tyler Higbee", team: "LAR", ppg: 11.1, fpts: 188.7, games: 17, rec: 47, recvYds: 495, tgt: 70 },
    { name: "Cole Kmet", team: "CHI", ppg: 10.8, fpts: 183.6, games: 17, rec: 73, recvYds: 719, tgt: 93 },
    { name: "Pat Freiermuth", team: "PIT", ppg: 10.5, fpts: 178.5, games: 17, rec: 32, recvYds: 308, tgt: 47 },
    { name: "Dalton Kincaid", team: "BUF", ppg: 10.2, fpts: 173.4, games: 17, rec: 73, recvYds: 673, tgt: 91 },
    { name: "Tucker Kraft", team: "GB", ppg: 9.9, fpts: 168.3, games: 17, rec: 31, recvYds: 355, tgt: 42 },
    { name: "Logan Thomas", team: "WAS", ppg: 9.6, fpts: 163.2, games: 17, rec: 55, recvYds: 496, tgt: 76 },
    { name: "Jake Browning", team: "CIN", ppg: 9.3, fpts: 158.1, games: 17, rec: 0, recvYds: 0, tgt: 0 },
    { name: "Hunter Henry", team: "NE", ppg: 9.0, fpts: 153.0, games: 17, rec: 42, recvYds: 419, tgt: 61 },
    { name: "Gerald Everett", team: "CHI", ppg: 8.7, fpts: 147.9, games: 17, rec: 51, recvYds: 411, tgt: 70 },
    { name: "Cade Otton", team: "TB", ppg: 8.4, fpts: 142.8, games: 17, rec: 47, recvYds: 455, tgt: 65 },
    { name: "Chigoziem Okonkwo", team: "TEN", ppg: 8.1, fpts: 137.7, games: 17, rec: 54, recvYds: 528, tgt: 75 },
    { name: "Taysom Hill", team: "NO", ppg: 7.8, fpts: 132.6, games: 17, rec: 33, recvYds: 291, tgt: 45 },
    { name: "Noah Fant", team: "SEA", ppg: 7.5, fpts: 127.5, games: 17, rec: 32, recvYds: 414, tgt: 48 },
    { name: "Mike Gesicki", team: "CIN", ppg: 7.2, fpts: 122.4, games: 17, rec: 29, recvYds: 244, tgt: 40 },
    { name: "Jonnu Smith", team: "MIA", ppg: 6.9, fpts: 117.3, games: 17, rec: 42, recvYds: 420, tgt: 55 },
    { name: "Zach Ertz", team: "DET", ppg: 6.6, fpts: 112.2, games: 17, rec: 27, recvYds: 187, tgt: 35 },
    { name: "Juwan Johnson", team: "NO", ppg: 6.3, fpts: 107.1, games: 17, rec: 37, recvYds: 368, tgt: 52 },
    { name: "Hayden Hurst", team: "CAR", ppg: 6.0, fpts: 102.0, games: 17, rec: 18, recvYds: 184, tgt: 25 },
    { name: "Tyler Conklin", team: "NYJ", ppg: 5.7, fpts: 96.9, games: 17, rec: 61, recvYds: 621, tgt: 89 },
    { name: "Isaiah Likely", team: "BAL", ppg: 5.4, fpts: 91.8, games: 17, rec: 30, recvYds: 411, tgt: 40 }
  ],
  K: [
    { name: "Brandon McManus", team: "HOU", ppg: 9.5, fpts: 161.5, games: 17 },
    { name: "Jake Elliott", team: "PHI", ppg: 9.2, fpts: 156.4, games: 17 },
    { name: "Tyler Bass", team: "BUF", ppg: 8.9, fpts: 151.3, games: 17 },
    { name: "Harrison Butker", team: "KC", ppg: 8.6, fpts: 146.2, games: 17 },
    { name: "Justin Tucker", team: "BAL", ppg: 8.3, fpts: 141.1, games: 17 },
    { name: "Younghoe Koo", team: "ATL", ppg: 8.0, fpts: 136.0, games: 17 },
    { name: "Dustin Hopkins", team: "CLE", ppg: 7.7, fpts: 130.9, games: 17 },
    { name: "Jason Sanders", team: "MIA", ppg: 7.4, fpts: 125.8, games: 17 },
    { name: "Matt Gay", team: "IND", ppg: 7.1, fpts: 120.7, games: 17 },
    { name: "Cameron Dicker", team: "LAC", ppg: 6.8, fpts: 115.6, games: 17 },
    { name: "Daniel Carlson", team: "LV", ppg: 6.5, fpts: 110.5, games: 17 },
    { name: "Greg Zuerlein", team: "NYJ", ppg: 6.2, fpts: 105.4, games: 17 },
    { name: "Evan McPherson", team: "CIN", ppg: 5.9, fpts: 100.3, games: 17 },
    { name: "Riley Patterson", team: "DET", ppg: 5.6, fpts: 95.2, games: 17 },
    { name: "Blake Grupe", team: "NO", ppg: 5.3, fpts: 90.1, games: 17 },
    { name: "Jason Myers", team: "SEA", ppg: 5.0, fpts: 85.0, games: 17 },
    { name: "Ka'imi Fairbairn", team: "HOU", ppg: 4.7, fpts: 79.9, games: 17 },
    { name: "Wil Lutz", team: "DEN", ppg: 4.4, fpts: 74.8, games: 17 },
    { name: "Andre Szmyt", team: "NYG", ppg: 4.1, fpts: 69.7, games: 17 },
    { name: "Cairo Santos", team: "CHI", ppg: 3.8, fpts: 64.6, games: 17 },
    { name: "Joey Slye", team: "NE", ppg: 3.5, fpts: 59.5, games: 17 },
    { name: "Chase McLaughlin", team: "TB", ppg: 3.2, fpts: 54.4, games: 17 },
    { name: "Lucas Havrisik", team: "CLE", ppg: 2.9, fpts: 49.3, games: 17 },
    { name: "Eddy Pineiro", team: "CAR", ppg: 2.6, fpts: 44.2, games: 17 },
    { name: "Chris Boswell", team: "PIT", ppg: 2.3, fpts: 39.1, games: 17 },
    { name: "Brett Maher", team: "LAR", ppg: 2.0, fpts: 34.0, games: 17 },
    { name: "Jake Moody", team: "SF", ppg: 1.7, fpts: 28.9, games: 17 },
    { name: "Matt Prater", team: "ARI", ppg: 1.4, fpts: 23.8, games: 17 },
    { name: "Graham Gano", team: "NYG", ppg: 1.1, fpts: 18.7, games: 17 }
  ],
  DEF: [
    { name: "Buffalo Bills", team: "BUF", ppg: 8.5, fpts: 144.5, games: 17 },
    { name: "Dallas Cowboys", team: "DAL", ppg: 8.2, fpts: 139.4, games: 17 },
    { name: "San Francisco 49ers", team: "SF", ppg: 7.9, fpts: 134.3, games: 17 },
    { name: "Miami Dolphins", team: "MIA", ppg: 7.6, fpts: 129.2, games: 17 },
    { name: "Baltimore Ravens", team: "BAL", ppg: 7.3, fpts: 124.1, games: 17 },
    { name: "Cleveland Browns", team: "CLE", ppg: 7.0, fpts: 119.0, games: 17 },
    { name: "Kansas City Chiefs", team: "KC", ppg: 6.7, fpts: 113.9, games: 17 },
    { name: "New York Jets", team: "NYJ", ppg: 6.4, fpts: 108.8, games: 17 },
    { name: "Pittsburgh Steelers", team: "PIT", ppg: 6.1, fpts: 103.7, games: 17 },
    { name: "Tampa Bay Buccaneers", team: "TB", ppg: 5.8, fpts: 98.6, games: 17 },
    { name: "Philadelphia Eagles", team: "PHI", ppg: 5.5, fpts: 93.5, games: 17 },
    { name: "Houston Texans", team: "HOU", ppg: 5.2, fpts: 88.4, games: 17 },
    { name: "Detroit Lions", team: "DET", ppg: 4.9, fpts: 83.3, games: 17 },
    { name: "New Orleans Saints", team: "NO", ppg: 4.6, fpts: 78.2, games: 17 },
    { name: "Seattle Seahawks", team: "SEA", ppg: 4.3, fpts: 73.1, games: 17 },
    { name: "Los Angeles Rams", team: "LAR", ppg: 4.0, fpts: 68.0, games: 17 },
    { name: "Cincinnati Bengals", team: "CIN", ppg: 3.7, fpts: 62.9, games: 17 },
    { name: "Indianapolis Colts", team: "IND", ppg: 3.4, fpts: 57.8, games: 17 },
    { name: "Las Vegas Raiders", team: "LV", ppg: 3.1, fpts: 52.7, games: 17 },
    { name: "Denver Broncos", team: "DEN", ppg: 2.8, fpts: 47.6, games: 17 },
    { name: "Atlanta Falcons", team: "ATL", ppg: 2.5, fpts: 42.5, games: 17 },
    { name: "Jacksonville Jaguars", team: "JAX", ppg: 2.2, fpts: 37.4, games: 17 },
    { name: "Green Bay Packers", team: "GB", ppg: 1.9, fpts: 32.3, games: 17 },
    { name: "Washington Commanders", team: "WAS", ppg: 1.6, fpts: 27.2, games: 17 },
    { name: "Chicago Bears", team: "CHI", ppg: 1.3, fpts: 22.1, games: 17 },
    { name: "New York Giants", team: "NYG", ppg: 1.0, fpts: 17.0, games: 17 },
    { name: "Arizona Cardinals", team: "ARI", ppg: 0.7, fpts: 11.9, games: 17 },
    { name: "Carolina Panthers", team: "CAR", ppg: 0.4, fpts: 6.8, games: 17 },
    { name: "New England Patriots", team: "NE", ppg: 0.1, fpts: 1.7, games: 17 },
    { name: "Los Angeles Chargers", team: "LAC", ppg: -0.2, fpts: -3.4, games: 17 }
  ]
};

async function computeComprehensiveScores() {
  console.log('Computing comprehensive scores using new system...');
  
  // Get all players with their seasons
  const players = await prisma.player.findMany({
    include: {
      seasons: {
        orderBy: { year: 'desc' }
      }
    }
  });

  // Group by player for the scoring system
  const mergedByPlayer: Record<string, any[]> = {};

  for (const player of players) {
    const playerId = player.id;
    mergedByPlayer[playerId] = [];
    
    for (const season of player.seasons) {
      // Map the season data to the format expected by scorePlayers
      const seasonData = {
        player_id: playerId,
        name: player.name,
        position: player.position,
        year: season.year,
        games: season.games,
        fpts: season.fpts,
        ppg: season.ppg,
        // RB metrics
        ppt: season.ppt,
        oppg: season.oppg,
        ypc: season.ypc,
        // WR/TE metrics
        tpg: season.tpg,
        yprr: season.yprr,
        ypt: season.ypt,
        adot: season.adot,
        // QB metrics
        ypa: season.ypa,
        pass_td_rate: season.pass_td_rate,
        int_rate: season.int_rate,
        rushing_ppg_index: season.rushing_ppg_index,
      };
      
      mergedByPlayer[playerId].push(seasonData);
    }
  }

  // Compute comprehensive scores
  const scoredPlayers = scorePlayers(mergedByPlayer);
  
  // Update the database with new scores
  for (const player of scoredPlayers) {
    // Update the most recent season with the new scores
    const latestSeason = await prisma.season.findFirst({
      where: { playerId: player.player_id },
      orderBy: { year: 'desc' }
    });
    
    if (latestSeason) {
      await prisma.season.update({
        where: { id: latestSeason.id },
        data: {
          draftScore: player.draft_score || 0,
          vorp: player.vorp || 0,
          // Update weighted metrics
          ppg_w: player.ppg_w,
          ppt_w: player.ppt_w,
          oppg_w: player.oppg_w,
          ypc_w: player.ypc_w,
          tpg_w: player.tpg_w,
          yprr_w: player.yprr_w,
          ypt_w: player.ypt_w,
          adot_w: player.adot_w,
          ypa_w: player.ypa_w,
          pass_td_rate_w: player.pass_td_rate_w,
          int_rate_w: player.int_rate_w,
          rushing_ppg_index_w: player.rushing_ppg_index_w,
        }
      });
    }
  }
  
  console.log(`Updated comprehensive scores for ${scoredPlayers.length} players`);
}

async function main() {
  console.log('Starting seed...');

  // Read the processed data
  const dataPath = path.join(__dirname, '../../../data/processed/players_merged.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const rbPlayers = JSON.parse(rawData);

  console.log(`Found ${rbPlayers.length} RB players to seed`);

  // Clear existing data
  await prisma.season.deleteMany();
  await prisma.player.deleteMany();

  // Seed RB players from actual data
  for (const playerData of rbPlayers) {
    const playerId = generatePlayerId(playerData.player, 'RB');
    
    // Debug: Check for Saquon Barkley
    if (playerData.player === 'Saquon Barkley') {
      console.log('Found Saquon Barkley:', playerData);
      console.log('Generated ID:', playerId);
    }
    
    // Create player
    const player = await prisma.player.create({
      data: {
        id: playerId,
        name: playerData.player,
        position: 'RB',
        team: playerData.team,
      },
    });

    // Create season record with computed metrics
    await prisma.season.create({
      data: {
        id: `${playerId}_2024`,
        playerId: player.id,
              year: 2024,
        games: playerData.games || 0,
        att: playerData.att || 0,
        tgt: playerData.tgt || 0,
        rec: playerData.rec || 0,
        rushYds: playerData.rush_yds || 0,
        recvYds: playerData.recv_yds || 0,
        totalTd: parseInt(playerData.tds) || 0,
        fpts: playerData.fpts || 0,
        ppg: parseFloat(playerData.Fpts_per_game) || 0,
        touches: playerData.touches || 0,
        ppt: playerData.ppt || 0,
        ypc: playerData.ypc || 0,
        ypr: playerData.ypr || 0,
        tpg: playerData.tpg || 0,
        oppg: playerData.oppg || 0,
        isRookie: false,
      },
    });
  }

  // Seed mock players for other positions
  for (const [position, players] of Object.entries(mockPlayers)) {
    for (const playerData of players) {
      const playerId = generatePlayerId(playerData.name, position);
      
      // Create player
      const player = await prisma.player.create({
        data: {
          id: playerId,
          name: playerData.name,
          position: position as 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF',
          team: playerData.team,
        },
      });

      // Calculate derived metrics
      const att = (playerData as any).att || 0
      const rec = (playerData as any).rec || 0
      const tgt = (playerData as any).tgt || 0
      const rushYds = (playerData as any).rushYds || 0
      const recvYds = (playerData as any).recvYds || (playerData as any).passYds || 0
      const passTd = (playerData as any).passTd || 0
      const rushTd = (playerData as any).rushTd || 0
      const recTd = (playerData as any).recTd || 0
      const ints = (playerData as any).ints || 0
      
      const touches = att + rec
      const totalTd = passTd + rushTd + recTd
      const ppt = touches > 0 ? playerData.ppg / touches : 0
      const ypc = att > 0 ? rushYds / att : 0
      const ypr = rec > 0 ? recvYds / rec : 0
      const tpg = playerData.games > 0 ? tgt / playerData.games : 0
      const oppg = playerData.games > 0 ? tgt / playerData.games : 0

      // Calculate position-specific derived metrics
      let derivedMetrics: any = {};
      
      if (position === 'QB') {
        // Map mock data fields to the format expected by deriveQB
        const mappedData = {
          ...playerData,
          pass_yds: (playerData as any).passYds || (playerData as any).recvYds || 0,
          pass_att: (playerData as any).att || 0,
          pass_td: (playerData as any).passTd || 0,
          ints: (playerData as any).ints || 0,
          rush_yds: (playerData as any).rushYds || 0,
          rush_td: (playerData as any).rushTd || 0,
        };
        const qbMetrics = deriveQB(mappedData);
        derivedMetrics = {
          ypa: qbMetrics.ypa,
          pass_td_rate: qbMetrics.pass_td_rate,
          int_rate: qbMetrics.int_rate,
          rushing_ppg_index: qbMetrics.rushing_ppg_index,
        };
      } else if (position === 'RB') {
        // Map mock data fields to the format expected by deriveRB
        const mappedData = {
          ...playerData,
          rush_yds: (playerData as any).rushYds || 0,
        };
        const rbMetrics = deriveRB(mappedData);
        derivedMetrics = {
          touches: rbMetrics.touches,
          ppt: rbMetrics.ppt,
          ypc: rbMetrics.ypc,
          oppg: rbMetrics.oppg,
        };
      } else if (position === 'WR' || position === 'TE') {
        // Map mock data fields to the format expected by deriveReceiver
        const mappedData = {
          ...playerData,
          recv_yds: (playerData as any).recvYds || 0,
          routes: (playerData as any).routes || 0,
          air_yds: (playerData as any).airYds || 0,
          rush_att: (playerData as any).rushAtt || 0,
        };
        const receiverMetrics = deriveReceiver(mappedData);
        derivedMetrics = {
          touches: receiverMetrics.touches,
          ppt: receiverMetrics.ppt,
          ypt: receiverMetrics.ypt,
          yprr: receiverMetrics.yprr,
          tpg: receiverMetrics.tpg,
          adot: receiverMetrics.adot,
        };
      }

      // Create season record with computed metrics
      await prisma.season.create({
        data: {
          id: `${playerId}_2024`,
          playerId: player.id,
          year: 2024,
          games: playerData.games || 17,
          att: att,
          tgt: tgt,
          rec: rec,
          rushYds: rushYds,
          recvYds: recvYds,
          totalTd: totalTd,
          // QB specific fields
          ypa: position === 'QB' ? (att > 0 ? recvYds / att : 0) : null,
          pass_td_rate: position === 'QB' ? (att > 0 ? passTd / att : 0) : null,
          int_rate: position === 'QB' ? (att > 0 ? ints / att : 0) : null,
          rushing_ppg_index: position === 'QB' ? ((rushYds / 10) + (rushTd * 6)) / (playerData.games || 17) : null,
          fpts: playerData.fpts || 0,
          ppg: playerData.ppg || 0,
          touches: derivedMetrics.touches || touches,
          ppt: derivedMetrics.ppt || ppt,
          ypc: derivedMetrics.ypc || ypc,
          ypr: derivedMetrics.ypt || ypr,
          tpg: derivedMetrics.tpg || tpg,
          oppg: derivedMetrics.oppg || oppg,
          // Position-specific metrics
          yprr: derivedMetrics.yprr,
          ypt: derivedMetrics.ypt,
          adot: derivedMetrics.adot,
          isRookie: false,
        },
      });
    }
  }

  console.log('Computing player scores and metrics...');
  
  // Use the new comprehensive scoring system
  await computeComprehensiveScores();
  
  // Also run the legacy scoring for backward compatibility
  await updatePlayerScores();
  await updateRookieProjections();

  console.log('Seed completed successfully');
  console.log(`Seeded ${rbPlayers.length} RB players + mock data for other positions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });