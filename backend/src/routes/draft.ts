import express from 'express';
import { createDraftSession, getDraftSession, makePick, undoPick } from '../services/draft.service';

const router = express.Router();

router.post('/draft/session', async (req, res) => {
  try {
    const result = createDraftSession();
    res.json(result);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/draft/:sessionId/board', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const session = getDraftSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Draft session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/draft/:sessionId/pick', async (req, res) => {
  const { sessionId } = req.params;
  const { playerId, teamSlot } = req.body;
  
  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }
  
  try {
    const session = await makePick(sessionId, playerId, teamSlot);
    if (!session) {
      return res.status(404).json({ error: 'Draft session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Make pick error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/draft/:sessionId/pick/:pickId', async (req, res) => {
  const { sessionId, pickId } = req.params;
  
  try {
    const session = undoPick(sessionId, pickId);
    if (!session) {
      return res.status(404).json({ error: 'Draft session or pick not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Undo pick error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as draftRouter };
