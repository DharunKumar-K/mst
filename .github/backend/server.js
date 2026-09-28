require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const loadRoutes = require('./routes');
const errorHandler = require('./middleware/error');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.get('/health', (_req, res) => res.json({ ok: true, data: { status: 'ok' } }));
app.use('/api', loadRoutes());
app.use((_req, res) => res.status(404).json({ ok: false, error: 'Route not found' }));
app.use(errorHandler);

async function start() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is required in production');
  } else {
    console.warn('MONGODB_URI is not set; database-backed routes will be unavailable');
  }

  const port = Number(process.env.PORT || 4000);
  return app.listen(port, () => console.log(`CirqProof API listening on port ${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, start };