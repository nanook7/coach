const { neon } = require('@neondatabase/serverless');

function isAuthorized(req) {
  if (!process.env.ADMIN_SECRET) return false;
  const auth = req.headers['authorization'] || '';
  return auth.replace('Bearer ', '').trim() === process.env.ADMIN_SECRET;
}

module.exports = async function handler(req, res) {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const id = parseInt(req.query.id, 10);
  if (!id) return res.status(400).json({ error: 'id query parameter required' });

  const { status } = req.body || {};
  const valid = ['pending', 'confirmed', 'cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'status must be pending, confirmed, or cancelled' });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      UPDATE bookings SET status = ${status} WHERE id = ${id} RETURNING id
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('booking update error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
