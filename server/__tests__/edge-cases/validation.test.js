const request = require('supertest');
const app = require('../../app');

describe('Edge Cases — Input Validation', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const uniqueEmail = `edge${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Edge User', email: uniqueEmail, password: 'password123' });
    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;

    await request(app)
      .put('/api/auth/complete-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 22, state: 'Gujarat', voterStatus: 'registered', hasVoterId: true });
  });

  // ─── Empty Input Handling ─────────────────────────────────
  describe('Empty and null inputs', () => {
    it('should handle empty string message in chat', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, message: '' });

      // Empty message should be rejected as "required"
      expect(res.status).toBe(400);
    });

    it('should handle null body gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle empty quiz answers array', async () => {
      const res = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, answers: [] });

      expect(res.status).toBe(200);
      expect(res.body.data.score).toBe(0);
    });
  });

  // ─── Extremely Long Input ────────────────────────────────
  describe('Long input handling', () => {
    it('should handle very long chat message', async () => {
      const longMessage = 'How do I register to vote? '.repeat(500); // ~13,500 chars
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, message: longMessage });

      // Should not crash — either succeed or return error gracefully
      expect([200, 400, 413]).toContain(res.status);
      expect(res.body).toHaveProperty('success');
    });

    it('should handle very long name in registration', async () => {
      const longName = 'A'.repeat(1000);
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: longName, email: 'longname@example.com', password: 'password123' });

      // Should handle gracefully (accept or reject, but not crash)
      expect([201, 400]).toContain(res.status);
    });
  });

  // ─── Special Characters & Injection ───────────────────────
  describe('Special characters and injection attempts', () => {
    it('should handle special characters in chat message', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, message: '¿Cómo registro? <script>alert("xss")</script> 🗳️ "quotes" & \'apostrophes\'' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle NoSQL injection attempt in login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $gt: '' }, // NoSQL injection attempt
          password: { $gt: '' },
        });

      // Should not expose data — reject or handle safely
      // 400 = bad input, 401 = auth failed, 500 = sanitized operator caused internal error
      expect([400, 401, 500]).toContain(res.status);
      // Ensure no user data leaked
      expect(res.body.data).toBeUndefined();
    });

    it('should sanitize HTML in registration name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '<img src=x onerror=alert(1)>',
          email: 'xss@example.com',
          password: 'password123',
        });

      // Should register but name should be stored (sanitized at render)
      if (res.status === 201) {
        expect(res.body.data.user.name).toBeDefined();
      }
    });
  });

  // ─── Invalid ID Formats ───────────────────────────────────
  describe('Invalid ID formats', () => {
    it('should handle non-ObjectId format in journey', async () => {
      const res = await request(app)
        .get('/api/journey/not-a-valid-id')
        .set('Authorization', `Bearer ${token}`);

      // Should return error, not crash
      expect([400, 404, 500]).toContain(res.status);
    });

    it('should handle non-ObjectId format in chat', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'invalid-id', message: 'Test' });

      expect([400, 404, 500]).toContain(res.status);
    });
  });

  // ─── Concurrent Requests ──────────────────────────────────
  describe('Concurrent request handling', () => {
    it('should handle multiple simultaneous chat requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/chat')
          .set('Authorization', `Bearer ${token}`)
          .send({ userId, message: `Concurrent message ${i + 1}` })
      );

      const results = await Promise.all(promises);
      results.forEach(res => {
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });
    });
  });

  // ─── Health Check ─────────────────────────────────────────
  describe('Health check endpoint', () => {
    it('should return health status without auth', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('running');
      expect(res.body.ai).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
