const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { getDatabase } = require('./database/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const cowRoutes = require('./routes/cows');
const vetRoutes = require('./routes/vet');
const governmentRoutes = require('./routes/government');
const marketplaceRoutes = require('./routes/marketplace');
const milkRoutes = require('./routes/milk');
const insuranceRoutes = require('./routes/insurance');
const transferRoutes = require('./routes/transfer');
const breedingRoutes = require('./routes/breeding');

// Initialize app
const app = express();

// Connect to SQLite database
try {
  getDatabase();
  console.log('✅ SQLite database connected');
} catch (error) {
  console.error('❌ Database connection error:', error);
  process.exit(1);
}

// Middleware - CORS Configuration
// Parse frontend URLs from environment or use defaults
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log CORS rejection for debugging
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      console.log(`✓ Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running with SQLite' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cows', cowRoutes);
app.use('/api/vet', vetRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/milk', milkRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/breeding', breedingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
