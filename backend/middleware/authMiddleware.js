const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // const token = req.header('Authorization');
  console.log("Headers:", req.headers); 
  const token = req.headers['authorization']; // Get the token from the headers
  console.log("Received Token:", token); // Log the token for debugging

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  // Extract the token from the 'Bearer <token>' format
  const tokenWithoutBearer = token.split(' ')[1];  // Get the token after 'Bearer'
  if (!tokenWithoutBearer) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next(); // Proceed if the user is an admin
};

module.exports = { authMiddleware, adminMiddleware };
