require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const { connectMainDB } = require('./connection/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const apiRoutes = require('./route/index');
const foodSecurityDatasetsRoutes = require('./route/foodSecurityDatasetsRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use('/api/master', foodSecurityDatasetsRoutes);
app.use('/api', apiRoutes);
app.use('/api', notFound);
app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

connectMainDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('SUGIDash API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
