import express from 'express';
import { getPlayers, getPlayerById } from '../services/players.service';

const router = express.Router();

router.get('/players', async (req, res) => {
  const { position, sort, order, page, limit } = req.query;
  const players = await getPlayers(
    position as string,
    sort as string,
    order as string,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10
  );
  res.json(players);
});

router.get('/players/:id', async (req, res) => {
  const { id } = req.params;
  const player = await getPlayerById(id);
  res.json(player);
});

export { router as playersRouter };
