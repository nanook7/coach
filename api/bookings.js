const { neon } = require('@neondatabase/serverless');

async function initDb(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id         SERIAL PRIMARY KEY,
      name       TEXT        NOT NULL,
      email      TEXT        NOT NULL,
      date       DATE        NOT NULL,
      time       TEXT        NOT NULL,
      group_size TEXT,
      notes      TEXT,
      status     TEXT        NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function isAuthorized(req) {
  if (!process.env.ADMIN_SECRET) return false;
  const auth = req.headers['authorization'] || '';
  return auth.replace('Bearer ', '').trim() === process.env.ADMIN_SECRET;
}

module.exports = async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await initDb(sql);

    if (req.method === 'GET') {
      if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
      const rows = await sql`
        SELECT * FROM bookings ORDER BY date ASC, time ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, email, date, time, group_size, notes } = req.body || {};
      if (!name || !email || !date || !time) {
        return res.status(400).json({ error: 'name, email, date, and time are required' });
      }
      const rows = await sql`
        INSERT INTO bookings (name, email, date, time, group_size, notes)
        VALUES (${name}, ${email}, ${date}, ${time}, ${group_size || null}, ${notes || null})
        RETURNING id
      `;
      return res.status(201).json({ success: true, id: rows[0].id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('bookings error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
