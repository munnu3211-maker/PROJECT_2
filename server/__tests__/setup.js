// ── Per-Test Setup (runs after Jest env is ready) ──

// Set test environment variables FIRST
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

// Mock connectDB BEFORE any app import
jest.mock('../config/db', () => jest.fn());

// Mock the Gemini service to avoid hitting real API during tests
jest.mock('../services/geminiService', () => {
  const mockInstance = {
    isAvailable: jest.fn().mockReturnValue(true),
    generate: jest.fn().mockResolvedValue({
      content: '{"steps": [{"number": 1, "title": "Test Step", "description": "Test description"}], "summary": "Test summary", "nextAction": "Test action", "reasoning": "Test reasoning", "confidenceScore": 90}',
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      keyUsed: 1,
    }),
  };
  return mockInstance;
});

// Mock Firebase Admin to avoid needing real credentials
jest.mock('../config/firebase', () => {
  const mockAdmin = {
    auth: () => ({
      verifyIdToken: jest.fn().mockRejectedValue(new Error('Mock: No real Firebase in tests')),
    }),
  };
  mockAdmin.firebaseInitialized = false;
  return mockAdmin;
});

// Mock Mistral service to avoid hitting real API during tests
jest.mock('../services/mistralService', () => {
  const mockInstance = {
    isAvailable: jest.fn().mockReturnValue(false), // Disabled by default in tests
    generate: jest.fn().mockResolvedValue({
      content: 'Mistral mock response',
      provider: 'mistral',
      model: 'mistral-small-latest',
    }),
  };
  return mockInstance;
});

// Connect to in-memory MongoDB
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  // Clean all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
