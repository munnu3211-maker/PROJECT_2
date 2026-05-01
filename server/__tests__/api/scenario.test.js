const request = require('supertest');
const app = require('../../app');

describe('Scenario API — /api/scenario', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Scenario User', email: 'scenario@example.com', password: 'password123' });
    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;

    await request(app)
      .put('/api/auth/complete-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 25, state: 'Karnataka', voterStatus: 'registered', hasVoterId: true });
  });

  describe('GET /api/scenario/list', () => {
    it('should return list of available scenarios', async () => {
      const res = await request(app)
        .get('/api/scenario/list')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);

      const scenario = res.body.data[0];
      expect(scenario).toHaveProperty('id');
      expect(scenario).toHaveProperty('title');
      expect(scenario).toHaveProperty('icon');
      expect(scenario).toHaveProperty('description');
    });
  });

  describe('POST /api/scenario', () => {
    it('should run a scenario successfully', async () => {
      const res = await request(app)
        .post('/api/scenario')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, scenarioType: 'first_time_voter' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.steps).toBeDefined();
      expect(Array.isArray(res.body.data.steps)).toBe(true);
    });

    it('should reject without userId', async () => {
      const res = await request(app)
        .post('/api/scenario')
        .set('Authorization', `Bearer ${token}`)
        .send({ scenarioType: 'lost_voter_id' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject without scenarioType', async () => {
      const res = await request(app)
        .post('/api/scenario')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/scenario')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: '507f1f77bcf86cd799439011', scenarioType: 'first_time_voter' });

      expect(res.status).toBe(404);
    });
  });
});
