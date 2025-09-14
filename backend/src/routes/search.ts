import express from 'express';
import { searchPlayers } from '../services/search.service';

const router = express.Router();

router.get('/search', async (req, res) => {
  const { q, limit } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const results = await searchPlayers(q, parseInt(limit as string) || 20);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as searchRouter };
