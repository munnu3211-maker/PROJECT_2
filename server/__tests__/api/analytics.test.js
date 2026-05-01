const request = require('supertest');
const app = require('../../app');

describe('Analytics API — /api/analytics', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const uniqueEmail = `analytics${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Analytics User', email: uniqueEmail, password: 'password123' });
    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;
  });

  describe('GET /api/analytics/insights/:userId', () => {
    it('should return insights for a user', async () => {
      const res = await request(app)
        .get(`/api/analytics/insights/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/analytics/insights/${userId}`);

      expect(res.status).toBe(401);
    });

    it('should handle non-existent userId gracefully', async () => {
      const res = await request(app)
        .get('/api/analytics/insights/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // Should return empty insights, not crash
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/analytics/recommendations/:userId', () => {
    it('should return recommendations for a user', async () => {
      const res = await request(app)
        .get(`/api/analytics/recommendations/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/analytics/recommendations/${userId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/analytics/stats', () => {
    it('should return global statistics', async () => {
      const res = await request(app)
        .get('/api/analytics/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/analytics/stats');

      expect(res.status).toBe(401);
    });
  });
});
