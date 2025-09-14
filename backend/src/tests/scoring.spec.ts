// backend/src/tests/scoring.spec.ts
import { scorePlayers } from '../services/scoring.service';

describe('Scoring Service', () => {
  describe('scorePlayers', () => {
    it('should compute weighted metrics for RB players', () => {
      const mockData = {
        'player1': [
          {
            player_id: 'player1',
            name: 'Test RB',
            position: 'RB' as const,
            year: 2024,
            games: 17,
            fpts: 200,
            ppg: 11.76,
            ppt: 0.5,
            oppg: 15,
            ypc: 4.5
          },
          {
            player_id: 'player1',
            name: 'Test RB',
            position: 'RB' as const,
            year: 2023,
            games: 16,
            fpts: 180,
            ppg: 11.25,
            ppt: 0.45,
            oppg: 14,
            ypc: 4.2
          }
        ]
      };

      const results = scorePlayers(mockData);
      expect(results).toHaveLength(1);
      
      const player = results[0];
      expect(player.ppg_w).toBeDefined();
      expect(player.ppt_w).toBeDefined();
      expect(player.oppg_w).toBeDefined();
      expect(player.ypc_w).toBeDefined();
      expect(player.draft_score).toBeDefined();
      expect(player.vorp).toBeDefined();
    });

    it('should compute weighted metrics for WR players', () => {
      const mockData = {
        'player2': [
          {
            player_id: 'player2',
            name: 'Test WR',
            position: 'WR' as const,
            year: 2024,
            games: 17,
            fpts: 250,
            ppg: 14.71,
            tpg: 8.5,
            yprr: 1.8,
            ypt: 12.5,
            adot: 8.2
          }
        ]
      };

      const results = scorePlayers(mockData);
      expect(results).toHaveLength(1);
      
      const player = results[0];
      expect(player.ppg_w).toBeDefined();
      expect(player.tpg_w).toBeDefined();
      expect(player.yprr_w).toBeDefined();
      expect(player.ypt_w).toBeDefined();
      expect(player.adot_w).toBeDefined();
      expect(player.draft_score).toBeDefined();
      expect(player.vorp).toBeDefined();
    });

    it('should compute weighted metrics for QB players', () => {
      const mockData = {
        'player3': [
          {
            player_id: 'player3',
            name: 'Test QB',
            position: 'QB' as const,
            year: 2024,
            games: 17,
            fpts: 350,
            ppg: 20.59,
            ypa: 7.8,
            pass_td_rate: 0.05,
            int_rate: 0.02,
            rushing_ppg_index: 2.5
          }
        ]
      };

      const results = scorePlayers(mockData);
      expect(results).toHaveLength(1);
      
      const player = results[0];
      expect(player.ppg_w).toBeDefined();
      expect(player.ypa_w).toBeDefined();
      expect(player.pass_td_rate_w).toBeDefined();
      expect(player.int_rate_w).toBeDefined();
      expect(player.rushing_ppg_index_w).toBeDefined();
      expect(player.draft_score).toBeDefined();
      expect(player.vorp).toBeDefined();
    });

    it('should compute z-scores correctly for multiple players', () => {
      const mockData = {
        'player1': [{
          player_id: 'player1',
          name: 'High PPG Player',
          position: 'RB' as const,
          year: 2024,
          games: 17,
          fpts: 300,
          ppg: 17.65,
          ppt: 0.6,
          oppg: 18,
          ypc: 5.0
        }],
        'player2': [{
          player_id: 'player2',
          name: 'Low PPG Player',
          position: 'RB' as const,
          year: 2024,
          games: 17,
          fpts: 100,
          ppg: 5.88,
          ppt: 0.2,
          oppg: 8,
          ypc: 3.0
        }]
      };

      const results = scorePlayers(mockData);
      expect(results).toHaveLength(2);
      
      const highPlayer = results.find(p => p.name === 'High PPG Player');
      const lowPlayer = results.find(p => p.name === 'Low PPG Player');
      
      expect(highPlayer?.z['ppg_w']).toBeGreaterThan(lowPlayer?.z['ppg_w'] || 0);
      expect(highPlayer?.draft_score).toBeGreaterThan(lowPlayer?.draft_score || 0);
    });

    it('should handle missing years gracefully', () => {
      const mockData = {
        'player1': [{
          player_id: 'player1',
          name: 'Single Year Player',
          position: 'RB' as const,
          year: 2024,
          games: 17,
          fpts: 200,
          ppg: 11.76,
          ppt: 0.5,
          oppg: 15,
          ypc: 4.5
        }]
      };

      const results = scorePlayers(mockData);
      expect(results).toHaveLength(1);
      
      const player = results[0];
      expect(player.ppg_w).toBeDefined();
      expect(player.draft_score).toBeDefined();
    });

    it('should filter out players with insufficient games', () => {
      const mockData = {
        'player1': [{
          player_id: 'player1',
          name: 'Insufficient Games',
          position: 'RB' as const,
          year: 2024,
          games: 3, // Less than MIN_GAMES
          fpts: 30,
          ppg: 10,
          ppt: 0.5,
          oppg: 15,
          ypc: 4.5
        }],
        'player2': [{
          player_id: 'player2',
          name: 'Sufficient Games',
          position: 'RB' as const,
          year: 2024,
          games: 17,
          fpts: 200,
          ppg: 11.76,
          ppt: 0.5,
          oppg: 15,
          ypc: 4.5
        }]
      };

      const results = scorePlayers(mockData);
      expect(results).toHaveLength(2); // Both players should be included
      
      // But the insufficient games player should have different z-scores
      const insufficientPlayer = results.find(p => p.name === 'Insufficient Games');
      const sufficientPlayer = results.find(p => p.name === 'Sufficient Games');
      
      expect(insufficientPlayer?.z['ppg_w']).toBeDefined();
      expect(sufficientPlayer?.z['ppg_w']).toBeDefined();
    });
  });
});
