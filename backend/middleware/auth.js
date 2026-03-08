const jwt = require('jsonwebtoken');

// JWT Secret - Should be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'gausetu-hackathon-secret-2026';
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set in environment - using default (NOT SECURE FOR PRODUCTION)');
}

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userType = decoded.type; // 'farmer'

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;
