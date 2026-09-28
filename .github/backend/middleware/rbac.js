function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, error: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ ok: false, error: 'Insufficient permissions' });
    return next();
  };
}

module.exports = { requireRole };