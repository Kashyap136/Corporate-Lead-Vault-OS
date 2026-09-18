const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { requireAuth } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const roiRoutes = require('./routes/roi');
const seoRoutes = require('./routes/seo');
const whatsappRoutes = require('./routes/whatsapp');
const auditRoutes = require('./routes/audit');

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Provide a MongoDB connection string via the MONGO_URI environment variable.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Provide a secret via the JWT_SECRET environment variable.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(express.json());

// CORS: allow configured frontend origin(s) plus local development origins.
// Requests without an Origin header (server-to-server, curl, proxied rewrites)
// are allowed so the Next.js rewrites and API clients keep working.
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').map(o => o.trim()).filter(Boolean).forEach(o => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  }
}));

app.use('/exports', express.static('public/exports'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', requireAuth, leadRoutes);
app.use('/api/roi', roiRoutes);
app.use('/api/seo', requireAuth, seoRoutes);
app.use('/api/whatsapp', requireAuth, whatsappRoutes);
app.use('/api/audit', requireAuth, auditRoutes);

// Unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler (Express 4 requires 4 args)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[unhandled error]', err && err.message);
  res.status(500).json({ error: 'Server error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Start cron jobs
    const { startCronJobs } = require('./cron');
    startCronJobs();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
