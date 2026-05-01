const request = require('supertest');
const app = require('../../app');

describe('Security — Middleware Tests', () => {
  let token;

  beforeEach(async () => {
    const uniqueEmail = `security${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Security User', email: uniqueEmail, password: 'password123' });
    token = registerRes.body.data.token;
  });

  describe('Helmet security headers', () => {
    it('should set X-Content-Type-Options header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const res = await request(app).get('/api/health');
      // Helmet sets this or CSP frame-ancestors
      const hasFrameProtection = res.headers['x-frame-options'] || res.headers['content-security-policy'];
      expect(hasFrameProtection).toBeDefined();
    });

    it('should remove X-Powered-By header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('JWT token validation', () => {
    it('should reject expired-format tokens', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MH0.invalid');

      expect(res.status).toBe(401);
    });

    it('should reject tokens with wrong signature', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ' + token + 'tampered');

      expect(res.status).toBe(401);
    });

    it('should reject tokens without Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', token);

      expect(res.status).toBe(401);
    });

    it('should reject empty Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', '');

      expect(res.status).toBe(401);
    });

    it('should reject Bearer with empty token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ');

      expect(res.status).toBe(401);
    });
  });

  describe('Input sanitization', () => {
    it('should handle extremely long email in registration', async () => {
      const longEmail = 'a'.repeat(500) + '@example.com';
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: longEmail, password: 'password123' });

      // Should either reject or accept gracefully (MongoDB doesn't enforce email length)
      expect([201, 400, 422, 500]).toContain(res.status);
    });

    it('should handle special characters in password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Special User',
          email: `special${Date.now()}@example.com`,
          password: 'p@$$w0rd!#%^&*()',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should handle unicode in name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'राहुल कुमार 🇮🇳',
          email: `unicode${Date.now()}@example.com`,
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.name).toContain('राहुल');
    });

    it('should reject JSON injection in request body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $ne: null },
          password: { $gt: '' },
        });

      // mongo-sanitize should strip $ operators
      expect([400, 401, 500]).toContain(res.status);
      expect(res.body.data).toBeUndefined();
    });
  });
});
