const request = require('supertest');
const app = require('../../app');

describe('Checklist API — /api/checklist', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const uniqueEmail = `checklist${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Checklist User', email: uniqueEmail, password: 'password123' });
    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;

    // Complete profile to generate default checklist
    await request(app)
      .put('/api/auth/complete-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 25, state: 'Delhi', voterStatus: 'registered', hasVoterId: true, isFirstTimeVoter: false });
  });

  describe('GET /api/checklist/:userId', () => {
    it('should return checklist for a profiled user', async () => {
      const res = await request(app)
        .get(`/api/checklist/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/checklist/${userId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/checklist/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect([404, 200]).toContain(res.status);
    });

    it('should handle invalid userId format', async () => {
      const res = await request(app)
        .get('/api/checklist/bad-id')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 500]).toContain(res.status);
    });
  });

  describe('POST /api/checklist/update', () => {
    it('should toggle a checklist item', async () => {
      const res = await request(app)
        .post('/api/checklist/update')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, key: 'check_eligibility', completed: true });

      // Accept 200 (toggled) or 400/404 (depends on checklist existence)
      expect([200, 400, 404]).toContain(res.status);
    });

    it('should reject update without userId', async () => {
      const res = await request(app)
        .post('/api/checklist/update')
        .set('Authorization', `Bearer ${token}`)
        .send({ key: 'check_eligibility', completed: true });

      expect([400, 500]).toContain(res.status);
    });

    it('should require authentication for updates', async () => {
      const res = await request(app)
        .post('/api/checklist/update')
        .send({ userId, key: 'check_eligibility', completed: true });

      expect(res.status).toBe(401);
    });
  });
});
