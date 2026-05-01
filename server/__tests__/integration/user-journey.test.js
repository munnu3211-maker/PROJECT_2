const request = require('supertest');
const app = require('../../app');

describe('Integration — Complete User Journey', () => {
  let token;
  let userId;

  it('should complete the full user journey: Register → Profile → Journey → Chat → Quiz', async () => {
    // ─── Step 1: Register ───────────────────────────────────
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Integration User', email: 'integration@example.com', password: 'password123' });

    expect(registerRes.status).toBe(201);
    token = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;
    expect(registerRes.body.data.user.profileCompleted).toBe(false);

    // ─── Step 2: Complete Profile ───────────────────────────
    const profileRes = await request(app)
      .put('/api/auth/complete-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 19,
        state: 'Maharashtra',
        voterStatus: 'not_registered',
        hasVoterId: false,
        isFirstTimeVoter: true,
        pincode: '400001',
      });

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.user.profileCompleted).toBe(true);
    expect(profileRes.body.data.user.state).toBe('Maharashtra');
    expect(profileRes.body.data.checklist).toBeDefined();

    // ─── Step 3: Get Personalized Journey ───────────────────
    const journeyRes = await request(app)
      .get(`/api/journey/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(journeyRes.status).toBe(200);
    expect(journeyRes.body.data.steps).toBeDefined();

    // ─── Step 4: Chat with AI ───────────────────────────────
    const chatRes = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId, message: 'How do I register to vote in Maharashtra?' });

    expect(chatRes.status).toBe(200);
    expect(chatRes.body.data.reply).toBeDefined();

    // ─── Step 5: Get Quiz ───────────────────────────────────
    const quizRes = await request(app)
      .get('/api/quiz')
      .set('Authorization', `Bearer ${token}`);

    expect(quizRes.status).toBe(200);
    expect(quizRes.body.data.questions.length).toBeGreaterThanOrEqual(5);

    // ─── Step 6: Submit Quiz ────────────────────────────────
    const quizSubmitRes = await request(app)
      .post('/api/quiz/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId,
        answers: [
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
        ],
      });

    expect(quizSubmitRes.status).toBe(200);
    expect(quizSubmitRes.body.data.score).toBe(10);
    expect(quizSubmitRes.body.data.readinessBonus).toBe(true);

    // ─── Step 7: Get Checklist ──────────────────────────────
    const checklistRes = await request(app)
      .get(`/api/checklist/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(checklistRes.status).toBe(200);
    expect(checklistRes.body.data.items).toBeDefined();
    expect(checklistRes.body.data.progress).toBeDefined();

    // ─── Step 8: Get Scenarios ──────────────────────────────
    const scenarioListRes = await request(app)
      .get('/api/scenario/list')
      .set('Authorization', `Bearer ${token}`);

    expect(scenarioListRes.status).toBe(200);
    expect(scenarioListRes.body.data.length).toBeGreaterThanOrEqual(10);

    // ─── Step 9: Verify User Profile Updated ────────────────
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.readinessScore).toBeGreaterThan(0);
  });
});
