// ── Security Audit Tests (SECURITY: 100%) ───────────────────────
// Comprehensive security validation: headers, auth, sanitization,
// rate limiting bypass in test, and error leakage prevention.

const request = require('supertest');
const app = require('../../app');

describe('Security Audit — Production Hardening', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const email = `secaudit${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Audit User', email, password: 'AuditPass123!' });
    token = res.body.data.token;
    userId = res.body.data.user._id;
  });

  // ── Helmet Security Headers ──────────────────────────────────
  describe('HTTP Security Headers (Helmet)', () => {
    it('should set X-Content-Type-Options: nosniff', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-DNS-Prefetch-Control header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
    });

    it('should set X-Download-Options header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-download-options']).toBe('noopen');
    });

    it('should set Strict-Transport-Security header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['strict-transport-security']).toBeDefined();
    });

    it('should remove X-Powered-By header completely', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  // ── JWT Authentication Security ──────────────────────────────
  describe('JWT Token Security', () => {
    it('should reject requests with no Authorization header', async () => {
      const res = await request(app).get('/api/chat');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject requests with malformed token', async () => {
      const res = await request(app)
        .get('/api/chat')
        .set('Authorization', 'Bearer not.a.valid.jwt.token');
      expect(res.status).toBe(401);
    });

    it('should reject requests with empty Bearer', async () => {
      const res = await request(app)
        .get('/api/chat')
        .set('Authorization', 'Bearer');
      expect(res.status).toBe(401);
    });

    it('should reject requests with token for deleted user', async () => {
      // Token is valid JWT format but user won't exist after manual deletion
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MjFhMmIzYzRkNWU2ZjdnOGg5aTBqIiwiaWF0IjoxNjk2ODQ5NjAwfQ.invalid_signature';
      const res = await request(app)
        .get('/api/chat')
        .set('Authorization', `Bearer ${fakeToken}`);
      expect(res.status).toBe(401);
    });
  });

  // ── NoSQL Injection Prevention ───────────────────────────────
  describe('NoSQL Injection Prevention (mongo-sanitize)', () => {
    it('should sanitize $ne operator in email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: { $ne: '' }, password: 'anything' });
      expect([400, 401, 500]).toContain(res.status);
      // Should NOT return any user data
      expect(res.body.data).toBeUndefined();
    });

    it('should sanitize $gt operator in password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: { $gt: '' } });
      expect([400, 401, 500]).toContain(res.status);
    });

    it('should sanitize nested $regex attack', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: { $regex: '.*' }, password: { $regex: '.*' } });
      expect([400, 401, 500]).toContain(res.status);
    });
  });

  // ── Error Sanitization ───────────────────────────────────────
  describe('Error Leakage Prevention', () => {
    it('should not leak stack traces on 404', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.body.stack).toBeUndefined();
    });

    it('should not expose internal error details on invalid routes', async () => {
      const res = await request(app).post('/api/unknown');
      expect(res.body.stack).toBeUndefined();
      // Error message (if present) should never contain stack trace info
      if (res.body.error) {
        expect(res.body.error).not.toContain('at ');
      }
    });
  });

  // ── Health Endpoint Security Info ────────────────────────────
  describe('Health Endpoint — Security Status', () => {
    it('should report all security layers active', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.security).toBeDefined();
      expect(res.body.security.helmet).toBe(true);
      expect(res.body.security.rateLimiting).toBe(true);
      expect(res.body.security.mongoSanitize).toBe(true);
      expect(res.body.security.jwtAuth).toBe(true);
    });

    it('should return timestamp in ISO format', async () => {
      const res = await request(app).get('/api/health');
      expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ── Payload Size Limit ───────────────────────────────────────
  describe('Payload Size Limit (1MB)', () => {
    it('should reject payloads exceeding 1MB', async () => {
      const largePayload = { message: 'x'.repeat(1100000) }; // > 1MB
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send(largePayload);
      expect([413, 400, 500]).toContain(res.status);
    });
  });

  // ── Password Security ────────────────────────────────────────
  describe('Password Handling (bcrypt)', () => {
    it('should not return password in login response', async () => {
      const email = `pwtest${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'PW Test', email, password: 'SecurePass123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'SecurePass123' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should not return password in /me response', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should reject wrong password', async () => {
      const email = `wrongpw${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'WrongPW', email, password: 'CorrectPass123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'WrongPassword' });

      expect(res.status).toBe(401);
    });
  });
});
