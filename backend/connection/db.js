const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('[FATAL] MONGO_URI is not set in the environment. Refusing to start.');
  console.error('Set MONGO_URI before starting the server (see backend/.env.example).');
  process.exit(1);
}

function connectMainDB() {
  return mongoose.connect(MONGO_URI);
}

const insightsConnection = mongoose.createConnection(
  MONGO_URI,
  { dbName: 'sugi_insights' }
);

insightsConnection.on('error', err => console.error('sugi_insights connection error:', err));
insightsConnection.once('open', () => console.log('sugi_insights MongoDB connected'));

function connectInsightsDB() {
  return insightsConnection;
}

module.exports = { connectMainDB, connectInsightsDB, insightsConnection };