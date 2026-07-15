const mongoose = require('mongoose');

const baseUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const insightsConnection = mongoose.createConnection(baseUri, {
  dbName: 'sugi_insights',
});

insightsConnection.on('error', err => console.error('sugi_insights connection error:', err));
insightsConnection.once('open', () => console.log('sugi_insights MongoDB connected'));

module.exports = insightsConnection;
