const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_SECRET) {
    return res.status(503).json({ error: 'Admin credentials not configured on server' });
  }

  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (hash !== process.env.ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  return res.status(200).json({ token: process.env.ADMIN_SECRET });
};
