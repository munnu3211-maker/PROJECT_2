const request = require('supertest');
const app = require('../../app');

describe('Journey API — /api/journey', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const uniqueEmail = `journey${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Journey User', email: uniqueEmail, password: 'password123' });
    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;

    // Complete profile (required for journey generation)
    await request(app)
      .put('/api/auth/complete-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 22, state: 'Maharashtra', voterStatus: 'not_registered', hasVoterId: false, isFirstTimeVoter: true });
  });

  describe('GET /api/journey/:userId', () => {
    it('should generate a personalized journey for a valid user', async () => {
      const res = await request(app)
        .get(`/api/journey/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/journey/${userId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/journey/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 400/500 for invalid userId format', async () => {
      const res = await request(app)
        .get('/api/journey/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 500]).toContain(res.status);
    });

    it('should include provider info in response', async () => {
      const res = await request(app)
        .get(`/api/journey/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.provider).toBeDefined();
    });
  });
});
