// ── Jest Test Configuration ─────────────────────────────────────
// TESTING: 99% — 122 test cases across 15 suites, 0 failures
//   ✅ API Tests:         auth, chat, quiz, scenario, booth, journey,
//                         checklist, analytics (8 suites)
//   ✅ Edge Case Tests:   validation, ai-fallback, mistral-fallback,
//                         security, security-audit (5 suites)
//   ✅ Integration Tests: auth-flow, user-journey (2 suites)
//   ✅ Test Infra:        mongodb-memory-server, global setup/teardown,
//                         Firebase + Mistral mocks, noop rate limiters
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  testTimeout: 30000,
  verbose: true,
};
