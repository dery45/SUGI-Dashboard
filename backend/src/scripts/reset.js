require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function reset() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugi-dashboard-demo');
  console.log('MongoDB connected');

  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    if (['users', 'croptypes', 'activitytypes', 'farmmasters', 'blocks', 'farmerassignments', 'taskassignments'].includes(col.name)) {
      await mongoose.connection.db.dropCollection(col.name);
      console.log(`Dropped ${col.name}`);
    }
  }

  console.log('Reset completed — fresh DB ready for seed');
  await mongoose.disconnect();
  process.exit(0);
}

reset().catch(e => { console.error('Reset error:', e); process.exit(1); });
