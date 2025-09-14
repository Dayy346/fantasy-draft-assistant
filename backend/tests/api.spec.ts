import request from 'supertest';
import app from '../src/app';

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('ts');
    });
  });

  describe('GET /api/players', () => {
    it('should return players list', async () => {
      const response = await request(app)
        .get('/api/players')
        .expect(200);

      expect(response.body).toHaveProperty('players');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should filter by position', async () => {
      const response = await request(app)
        .get('/api/players?position=RB')
        .expect(200);

      expect(response.body.players).toBeDefined();
    });
  });

  describe('GET /api/search', () => {
    it('should return search results', async () => {
      const response = await request(app)
        .get('/api/search?q=test')
        .expect(200);

      expect(response.body).toHaveProperty('players');
      expect(response.body).toHaveProperty('total');
    });

    it('should require query parameter', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/metrics', () => {
    it('should return position metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/draft/session', () => {
    it('should create draft session', async () => {
      const response = await request(app)
        .post('/api/draft/session')
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
    });
  });
});
