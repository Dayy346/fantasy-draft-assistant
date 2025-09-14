import express from 'express';
import { computePositionMetrics } from '../services/scoring.service';

const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    const metrics = await computePositionMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as metricsRouter };
