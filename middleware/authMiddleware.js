const jwt = require("jsonwebtoken");
const config = require("../config/db");

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  // Usually token comes as "Bearer <token>"
  const token = authHeader.split(' ')[1] || authHeader;

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = decoded; // contains userId and role
    next();
  });
};

// Middleware to authorize specific roles
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
