// ── Global Setup: Start MongoDB Memory Server ──
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_TEST_URI = mongoServer.getUri();
  // Store the server instance for teardown
  global.__MONGOSERVER__ = mongoServer;
};
