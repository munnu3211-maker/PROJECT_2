const request = require('supertest');
const app = require('../../app');

describe('Integration — Authentication Flow', () => {
  it('should complete: Register → Login → Get Me → Update Profile → Verify Token', async () => {
    // ─── Step 1: Register ───────────────────────────────────
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Auth Flow User', email: 'authflow@example.com', password: 'password123' });

    expect(registerRes.status).toBe(201);
    const registerToken = registerRes.body.data.token;
    const userId = registerRes.body.data.user._id;

    // ─── Step 2: Login with same credentials ────────────────
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'authflow@example.com', password: 'password123' });

    expect(loginRes.status).toBe(200);
    const loginToken = loginRes.body.data.token;
    expect(loginToken).toBeDefined();

    // ─── Step 3: Access protected route with login token ────
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('authflow@example.com');

    // ─── Step 4: Complete Profile ───────────────────────────
    const profileRes = await request(app)
      .put('/api/auth/complete-profile')
      .set('Authorization', `Bearer ${loginToken}`)
      .send({ age: 21, state: 'Rajasthan', voterStatus: 'not_registered', hasVoterId: false });

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.user.profileCompleted).toBe(true);

    // ─── Step 5: Update Profile ─────────────────────────────
    const updateRes = await request(app)
      .put('/api/auth/update-profile')
      .set('Authorization', `Bearer ${loginToken}`)
      .send({ name: 'Updated Name', voterStatus: 'registered', hasVoterId: true });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.user.name).toBe('Updated Name');
    expect(updateRes.body.data.user.voterStatus).toBe('registered');
    expect(updateRes.body.data.user.hasVoterId).toBe(true);

    // ─── Step 6: Verify old register token still works ──────
    const verifyRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerToken}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.user.name).toBe('Updated Name');
  });

  it('should prevent access after using invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer totally.invalid.token');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should prevent access without any token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
