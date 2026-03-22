const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Placeholder for future JWT validation
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    // For now we just pass through since it's dummy data phase
    // return res.status(401).json({ message: 'No token provided' });
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    req.user = decoded;
    next();
  } catch (err) {
    // return res.status(401).json({ message: 'Invalid token' });
    next();
  }
};

module.exports = authMiddleware;
