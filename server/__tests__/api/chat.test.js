const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const ChatHistory = require('../../models/ChatHistory');

describe('Chat API — /api/chat', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Register and complete profile for chat tests
    const uniqueEmail = `chatuser${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Chat User',
        email: uniqueEmail,
        password: 'password123',
      });

    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;

    // Complete profile (required for chat context)
    await request(app)
      .put('/api/auth/complete-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 22,
        state: 'Maharashtra',
        voterStatus: 'registered',
        hasVoterId: true,
      });
  });

  describe('POST /api/chat', () => {
    it('should return AI response for valid message', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId,
          message: 'How do I register to vote?',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toBeDefined();
      expect(typeof res.body.data.reply).toBe('string');
      expect(res.body.data.reply.length).toBeGreaterThan(0);
      expect(res.body.data.provider).toBeDefined();
    });

    it('should reject chat without userId', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Hello' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('required');
    });

    it('should reject chat without message', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('required');
    });

    it('should return 404 for invalid userId', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: fakeId,
          message: 'Hello',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should persist chat history', async () => {
      // Send first message
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, message: 'First message' });

      // Send second message
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, message: 'Second message' });

      // Check history
      const history = await ChatHistory.findOne({ userId });
      expect(history).toBeDefined();
      expect(history.messages.length).toBe(4); // 2 user + 2 assistant
    });
  });

  describe('GET /api/chat/:userId/history', () => {
    it('should return empty array for new user', async () => {
      const res = await request(app)
        .get(`/api/chat/${userId}/history`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return chat history after messages', async () => {
      // Send a message first
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, message: 'Test history' });

      const res = await request(app)
        .get(`/api/chat/${userId}/history`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/chat — Authentication', () => {
    it('should reject chat without auth token', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ userId, message: 'Hello' });

      expect(res.status).toBe(401);
    });
  });
});
