import { findUserById, findUserByEmail } from '../db/localDb.js';

/**
 * Auth middleware — extracts userId from Bearer token,
 * looks up plan/credits from SQLite, attaches to req.
 */
export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    // Token format: "quickai-token-<userId>" or "quickai-token-<hex>"
    // During signup flow, userId = email. After login it's a random hex but
    // we store userId in the token-map via localStorage on client.
    // For simplicity, userId is embedded directly OR we derive from token prefix.
    let userId = 'guest';

    if (token.startsWith('quickai-token-')) {
      // Try to get userId from the part after the prefix
      // Client always sends the email as userId when building token in MockClerk
      const part = token.replace('quickai-token-', '');
      // Check if part looks like an email (contains @)
      if (part.includes('@') || part.includes('-anon')) {
        userId = part;
      } else {
        // Random hex token from login — look it up via stored session
        // Fallback: use guest
        userId = part;
      }
    }

    // Try to find user in SQLite
    let user = findUserById(userId) || findUserByEmail(userId);

    if (user) {
      req.userId   = user.id;
      req.userEmail= user.email;
      req.plan     = user.plan || 'free';
      req.credits  = user.credits;
      req.isAdmin  = user.role === 'admin';
    } else {
      // Unknown user — allow as guest with limited access
      req.userId   = userId;
      req.plan     = 'free';
      req.credits  = 0;
      req.isAdmin  = false;
    }

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err.message);
    req.userId = 'guest';
    req.plan   = 'free';
    next();
  }
};
