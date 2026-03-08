require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { getDatabase } = require('../database/db');
const errorHandler = require('../middleware/errorHandler');
const fs = require('fs');
const path = require('path');

// Initialize database on startup
const initializeDatabase = () => {
  const dbPath = path.join(__dirname, '../database/livestock.db');
  const dbExists = fs.existsSync(dbPath);
  
  if (!dbExists) {
    console.log('🗄️  Database not found, initializing...');
    try {
      require('../database/init');
    } catch (error) {
      console.error('❌ Error initializing database:', error.message);
    }
  }
};

// Run initialization
initializeDatabase();

// Import routes
const authRoutes = require('../routes/auth');
const cowRoutes = require('../routes/cows');
const vetRoutes = require('../routes/vet');
const governmentRoutes = require('../routes/government');
const marketplaceRoutes = require('../routes/marketplace');
const milkRoutes = require('../routes/milk');
const insuranceRoutes = require('../routes/insurance');
const transferRoutes = require('../routes/transfer');
const breedingRoutes = require('../routes/breeding');

// Initialize Express app
const app = express();

// Connect to SQLite database
try {
  getDatabase();
  console.log('✅ SQLite database connected');
} catch (error) {
  console.error('❌ Database connection error:', error);
}

// Middleware - CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://Chinmay048.github.io',
  process.env.FRONTEND_URL || ''
]
  .filter(Boolean)
  .map(url => url.trim());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Exact match or subdomain match
      return origin === allowedOrigin || origin.endsWith(allowedOrigin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
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

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Gau Setu Backend API', 
    status: 'running',
    baseUrl: 'https://backend-steel-two-36.vercel.app/api',
    endpoints: {
      auth: '/api/auth',
      cows: '/api/cows',
      vet: '/api/vet',
      government: '/api/government',
      marketplace: '/api/marketplace',
      milk: '/api/milk',
      insurance: '/api/insurance',
      transfer: '/api/transfer',
      breeding: '/api/breeding'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running with SQLite', environment: process.env.NODE_ENV });
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

module.exports = app;
