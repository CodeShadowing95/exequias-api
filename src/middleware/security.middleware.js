import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message = '';

    switch (role) {
      case 'admin':
        limit = 100;
        message = 'Admin request limit exceeded (100 per minute). Slow down.';
        break;
      case 'user':
        limit = 50;
        message = 'User request limit exceeded (50 per minute). Slow down.';
        break;
      default:
        limit = 10;
        message = 'Guest request limit exceeded (10 per minute). Slow down.';
        break;
    }

    const client = aj.withRule(slidingWindow({ mode: 'LIVE', interval: '1m', max: limit, name: `${role}_rate_limit` }));

    const decision = await client.protect(req);
    logger.info(
      `Arcjet middleware decision : ${decision}`
    );

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request detected.', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });
      res.status(403).json({ error: 'Forbidden', message: 'Automated requests are not allowed.' });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request detected.', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path, method: req.method });
      res.status(403).json({ error: 'Forbidden', message: 'Request blocked by security policy.' });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit request detected.', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });
      res.status(403).json({ error: 'Forbidden', message: 'Too many requests. Please try again later.' });
    }

    next();
  } catch (error) {
    logger.error(
      `Erreur Arcjet middleware : ${error}`
    );
    res.status(500).json({ error: 'Forbidden', message: 'Erreur survenue lors de la vérification de la sécurité.' });
  }
};

export default securityMiddleware;