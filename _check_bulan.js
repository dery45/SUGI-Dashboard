const mongoose = require('mongoose');
const conn = mongoose.createConnection('mongodb://localhost:27017/sugi');
conn.on('error', e => { console.error(e); process.exit(1); });
conn.once('open', async () => {
  const coll = conn.collection('hargaprodusennasionals');
  const r = await coll.aggregate([
    { $group: { _id: '$bulan', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]).toArray();
  console.log('bulan values:', JSON.stringify(r, null, 2));
  await conn.close();
});
