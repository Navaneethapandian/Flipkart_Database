const jwt = require("jsonwebtoken");
const config = require("../config/db");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1] || authHeader;

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = decoded; 
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
