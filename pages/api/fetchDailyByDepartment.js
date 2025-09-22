// GET /api/fetchDailyByDepartment?date=YYYY-MM-DD
// Proxies to external daily by-department API using server-side/public envs.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Missing required query param: date (YYYY-MM-DD)' });
    }

    const baseUrl = process.env.DAILY_TOTALS_BASE_URL || process.env.NEXT_PUBLIC_AI_SERVER_BASE_URL || 'https://skilled-amazingly-whippet.ngrok-free.app';
    const token = process.env.DAILY_TOTALS_TOKEN || (process.env.NEXT_PUBLIC_NAMGYU_FAST_API_KEY || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return res.status(500).json({ error: 'Server not configured: set DAILY_TOTALS_TOKEN or NEXT_PUBLIC_NAMGYU_FAST_API_KEY' });
    }

    const url = `${baseUrl.replace(/\/$/, '')}/articles/daily/by-department?date=${encodeURIComponent(date)}`;
    const rsp = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
    });

    if (!rsp.ok) {
      const text = await rsp.text();
      return res.status(rsp.status).json({ error: 'Upstream error', status: rsp.status, body: text });
    }
    const data = await rsp.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
