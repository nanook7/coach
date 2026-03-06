const { neon } = require('@neondatabase/serverless');

const DEFAULTS = { weekdays: [0, 5, 6], times: ['10:00', '14:00'] };

async function initDb(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS availability (
      id           INTEGER PRIMARY KEY DEFAULT 1,
      weekdays_json TEXT    NOT NULL DEFAULT '[0,5,6]',
      times_json    TEXT    NOT NULL DEFAULT '["10:00","14:00"]'
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
    return res.status(200).json(DEFAULTS);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await initDb(sql);

    if (req.method === 'GET') {
      const rows = await sql`SELECT weekdays_json, times_json FROM availability WHERE id = 1`;
      if (rows.length === 0) return res.status(200).json(DEFAULTS);
      return res.status(200).json({
        weekdays: JSON.parse(rows[0].weekdays_json),
        times:    JSON.parse(rows[0].times_json),
      });
    }

    if (req.method === 'PUT') {
      if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
      const { weekdays, times } = req.body || {};
      if (!Array.isArray(weekdays) || !Array.isArray(times)) {
        return res.status(400).json({ error: 'weekdays and times arrays required' });
      }
      await sql`
        INSERT INTO availability (id, weekdays_json, times_json)
        VALUES (1, ${JSON.stringify(weekdays)}, ${JSON.stringify(times)})
        ON CONFLICT (id) DO UPDATE
          SET weekdays_json = EXCLUDED.weekdays_json,
              times_json    = EXCLUDED.times_json
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('availability error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
