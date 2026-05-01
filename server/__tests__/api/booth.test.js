const request = require('supertest');
const app = require('../../app');

describe('Booth API — /api/booth', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const uniqueEmail = `booth${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Booth User', email: uniqueEmail, password: 'password123' });
    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;

    await request(app)
      .put('/api/auth/complete-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 30, state: 'Tamil Nadu', voterStatus: 'registered', hasVoterId: true, pincode: '600001' });
  });

  describe('POST /api/booth', () => {
    it('should return booth guidance with pincode', async () => {
      const res = await request(app)
        .post('/api/booth')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, pincode: '600001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      // Accept either AI-generated or fallback structure
      const data = res.body.data;
      const hasBoothStructure = data.howToFind || data.steps || data.boothProcess;
      expect(hasBoothStructure).toBeTruthy();
      expect(res.body.provider).toBeDefined();
    });

    it('should reject without userId', async () => {
      const res = await request(app)
        .post('/api/booth')
        .set('Authorization', `Bearer ${token}`)
        .send({ pincode: '600001' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/booth')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: '507f1f77bcf86cd799439011' });

      expect(res.status).toBe(404);
    });
  });
});
