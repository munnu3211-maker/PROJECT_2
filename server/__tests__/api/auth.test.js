const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

describe('Auth API — /api/auth', () => {
  // ─── Registration Tests ───────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'securepassword123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe('Test User');
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User' }); // Missing email and password

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('required');
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345', // Too short (min 6)
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('6 characters');
    });

    it('should reject duplicate email registration', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'password123',
        });

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'password456',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already exists');
    });
  });

  // ─── Login Tests ──────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'password123',
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({}); // No email or password

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Google Auth Tests ────────────────────────────────────
  describe('POST /api/auth/google', () => {
    it('should reject Google auth without idToken', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({});

      // Should either return 400 (missing token) or 503 (Firebase not configured)
      expect([400, 503]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Protected Route Tests ────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user data with valid token', async () => {
      // Register to get token
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Auth User',
          email: 'authuser@example.com',
          password: 'password123',
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('authuser@example.com');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Complete Profile Tests ───────────────────────────────
  describe('PUT /api/auth/complete-profile', () => {
    let token;

    beforeEach(async () => {
      const uniqueEmail = `profile${Date.now()}@example.com`;
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Profile User',
          email: uniqueEmail,
          password: 'password123',
        });
      token = registerRes.body.data.token;
    });

    it('should complete profile with valid data', async () => {
      const res = await request(app)
        .put('/api/auth/complete-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          age: 22,
          state: 'Maharashtra',
          voterStatus: 'registered',
          hasVoterId: true,
          isFirstTimeVoter: true,
          pincode: '400001',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.profileCompleted).toBe(true);
      expect(res.body.data.user.state).toBe('Maharashtra');
      expect(res.body.data.checklist).toBeDefined();
    });

    it('should reject profile without required fields', async () => {
      const res = await request(app)
        .put('/api/auth/complete-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ pincode: '400001' }); // Missing age and state

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject underage users', async () => {
      const res = await request(app)
        .put('/api/auth/complete-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ age: 15, state: 'Delhi' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
