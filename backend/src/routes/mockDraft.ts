import express from 'express';
import { 
  createMockDraftSession, 
  getMockDraftSession, 
  makeMockDraftPick, 
  getBotPick, 
  startMockDraft,
  getMockDraftSessions,
  deleteMockDraftSession
} from '../services/mockDraft.service';

const router = express.Router();

// Create a new mock draft session
router.post('/mock-draft/session', async (req, res) => {
  try {
    const { numTeams = 12, isSnake = true, totalRounds = 15 } = req.body;
    
    if (numTeams < 2 || numTeams > 12) {
      return res.status(400).json({ error: 'Number of teams must be between 2 and 12' });
    }
    
    if (totalRounds < 5 || totalRounds > 20) {
      return res.status(400).json({ error: 'Total rounds must be between 5 and 20' });
    }

    const session = createMockDraftSession(numTeams, isSnake, totalRounds);
    res.json(session);
  } catch (error) {
    console.error('Create mock draft session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mock draft session
router.get('/mock-draft/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getMockDraftSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Mock draft session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Get mock draft session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start mock draft (load players)
router.post('/mock-draft/:sessionId/start', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await startMockDraft(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Mock draft session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Start mock draft error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Make a pick (human or bot)
router.post('/mock-draft/:sessionId/pick', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { playerId, isHuman = true } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }
    
    const session = await makeMockDraftPick(sessionId, playerId, isHuman);
    
    if (!session) {
      return res.status(404).json({ error: 'Mock draft session not found or invalid pick' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Make mock draft pick error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bot pick suggestion
router.get('/mock-draft/:sessionId/bot-pick', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const playerId = await getBotPick(sessionId);
    
    if (!playerId) {
      return res.status(404).json({ error: 'No bot pick available' });
    }
    
    res.json({ playerId });
  } catch (error) {
    console.error('Get bot pick error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all mock draft sessions
router.get('/mock-draft', async (req, res) => {
  try {
    const sessions = getMockDraftSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Get mock draft sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete mock draft session
router.delete('/mock-draft/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = deleteMockDraftSession(sessionId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Mock draft session not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete mock draft session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as mockDraftRouter };
