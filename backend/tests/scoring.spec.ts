import { computeZScore, computeDraftScore, computeVORP } from '../src/services/scoring.service';

describe('Scoring Service', () => {
  describe('computeZScore', () => {
    it('should compute correct z-score', () => {
      const result = computeZScore(15, 10, 2);
      expect(result).toBe(2.5);
    });

    it('should handle zero standard deviation', () => {
      const result = computeZScore(15, 10, 0);
      expect(result).toBe(0);
    });
  });

  describe('computeDraftScore', () => {
    const mockPositionMetrics = {
      position: 'RB',
      means: { ppg: 10, ppt: 0.5, oppg: 15, ypc: 4.0, consistency: 0.8 },
      stdDevs: { ppg: 2, ppt: 0.1, oppg: 3, ypc: 0.5, consistency: 0.2 },
      weights: { ppg: 0.4, ppt: 0.2, oppg: 0.15, ypc: 0.1, injury: -0.1, consistency: 0.05 }
    };

    it('should compute draft score for RB', () => {
      const season = {
        ppg: 15,
        ppt: 0.7,
        oppg: 18,
        ypc: 4.5,
        consistency: 0.9,
        games: 16
      };

      const result = computeDraftScore(season, mockPositionMetrics);
      expect(result).toBeGreaterThan(0);
    });

    it('should handle missing data gracefully', () => {
      const season = {
        ppg: null,
        ppt: null,
        oppg: null,
        ypc: null,
        consistency: null,
        games: 16
      };

      const result = computeDraftScore(season, mockPositionMetrics);
      expect(result).toBe(0);
    });
  });

  describe('computeVORP', () => {
    it('should compute VORP correctly', () => {
      const season = { ppg: 15 };
      const replacementBaselines = { RB: 8 };
      
      const result = computeVORP(season, 'RB', replacementBaselines);
      expect(result).toBe(7);
    });
  });
});
