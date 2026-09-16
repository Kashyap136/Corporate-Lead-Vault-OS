const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const roiRoutes = require('./routes/roi');
const seoRoutes = require('./routes/seo');
const whatsappRoutes = require('./routes/whatsapp');
const auditRoutes = require('./routes/audit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/exports', express.static('public/exports'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/roi', roiRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/audit', auditRoutes);

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
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
