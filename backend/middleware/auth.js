const jwt = require('jsonwebtoken');

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function verifyToken(req) {
  const token = extractToken(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.companyId || null;
  } catch (err) {
    return null;
  }
}

// Require a valid JWT and attach req.companyId derived from the token.
function requireAuth(req, res, next) {
  const companyId = verifyToken(req);
  if (!companyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.companyId = companyId;
  next();
}

// Attach company identity when a valid JWT is present; otherwise continue
// (used for endpoints that must also work for anonymous public callers).
function optionalAuth(req, res, next) {
  const companyId = verifyToken(req);
  if (companyId) {
    req.companyId = companyId;
  }
  next();
}

module.exports = { requireAuth, optionalAuth };