const jwt = require('jsonwebtoken');
const User = require('../models/User');

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ ok: false, error: 'Authentication required' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ ok: false, error: 'Authentication is not configured' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(payload.sub).then((user) => {
      if (!user) return res.status(401).json({ ok: false, error: 'Invalid authentication token' });
      req.user = user;
      next();
    }).catch(next);
  } catch (_error) {
    return res.status(401).json({ ok: false, error: 'Invalid or expired authentication token' });
  }
}

module.exports = { requireAuth };