const request = require('supertest');
const app = require('../../app');

describe('Quiz API — /api/quiz', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Quiz User',
        email: 'quizuser@example.com',
        password: 'password123',
      });

    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;

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

  describe('GET /api/quiz', () => {
    it('should return quiz questions', async () => {
      const res = await request(app)
        .get('/api/quiz')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questions).toBeDefined();
      expect(Array.isArray(res.body.data.questions)).toBe(true);
      expect(res.body.data.questions.length).toBeGreaterThanOrEqual(5);

      // Validate question structure
      const question = res.body.data.questions[0];
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('correct');
      expect(question).toHaveProperty('explanation');
      expect(question.options).toHaveLength(4);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/quiz');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/quiz/submit', () => {
    it('should score quiz correctly — all correct answers', async () => {
      const answers = [
        { questionId: 1, selectedAnswer: 1 },
        { questionId: 2, selectedAnswer: 1 },
        { questionId: 3, selectedAnswer: 1 },
        { questionId: 4, selectedAnswer: 0 },
        { questionId: 5, selectedAnswer: 1 },
        { questionId: 6, selectedAnswer: 2 },
        { questionId: 7, selectedAnswer: 1 },
        { questionId: 8, selectedAnswer: 1 },
        { questionId: 9, selectedAnswer: 2 },
        { questionId: 10, selectedAnswer: 1 },
      ];

      const res = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, answers });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(10);
      expect(res.body.data.total).toBe(10);
      expect(res.body.data.percentage).toBe(100);
      expect(res.body.data.readinessBonus).toBe(true);
    });

    it('should score quiz correctly — some wrong answers', async () => {
      const answers = [
        { questionId: 1, selectedAnswer: 0 }, // Wrong
        { questionId: 2, selectedAnswer: 0 }, // Wrong
        { questionId: 3, selectedAnswer: 1 }, // Correct
        { questionId: 4, selectedAnswer: 0 }, // Correct
        { questionId: 5, selectedAnswer: 0 }, // Wrong
      ];

      const res = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId, answers });

      expect(res.status).toBe(200);
      expect(res.body.data.score).toBe(2);
      expect(res.body.data.readinessBonus).toBe(false); // Score < 7
    });

    it('should reject quiz submission without userId', async () => {
      const res = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({ answers: [{ questionId: 1, selectedAnswer: 0 }] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject quiz submission without answers', async () => {
      const res = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
