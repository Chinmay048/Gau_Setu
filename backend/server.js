const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { getDatabase } = require('./database/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const cowRoutes = require('./routes/cows');

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

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:8080',
    'http://10.252.52.7:8080'
  ],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running with SQLite' });
});

// API Routes
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cows', cowRoutes);

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
