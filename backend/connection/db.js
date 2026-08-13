const mongoose = require('mongoose');

function connectMainDB() {
  return mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugi-dashboard-demo');
}

const insightsConnection = mongoose.createConnection(
  process.env.MONGO_URI || 'mongodb://localhost:27017',
  { dbName: 'sugi_insights' }
);

insightsConnection.on('error', err => console.error('sugi_insights connection error:', err));
insightsConnection.once('open', () => console.log('sugi_insights MongoDB connected'));

function connectInsightsDB() {
  return insightsConnection;
}

module.exports = { connectMainDB, connectInsightsDB, insightsConnection };