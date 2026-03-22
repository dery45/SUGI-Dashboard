require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes setup
const apiRoutes = require('./src/routes/index');
app.use('/api', apiRoutes);

// Database connection placeholder (skipping actual connection for dummy data phase if needed, but we structure it)
/*
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
*/

app.get('/', (req, res) => {
  res.send('Pangan Dashboard API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
