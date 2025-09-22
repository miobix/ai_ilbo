export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nid } = req.query;
  if (!nid) return res.status(400).json({ message: 'Missing nid parameter' });

  const baseUrl = process.env.SPELLING_DETAILS_BASE_URL || process.env.DAILY_TOTALS_BASE_URL || process.env.NEXT_PUBLIC_AI_SERVER_BASE_URL;
  const token = process.env.SPELLING_DETAILS_TOKEN || process.env.DAILY_TOTALS_TOKEN || process.env.NEXT_PUBLIC_NAMGYU_FAST_API_KEY;

  if (!baseUrl || !token) {
    return res.status(500).json({ message: 'Server configuration error: base URL or token missing' });
  }

  const url = `${baseUrl.replace(/\/$/, '')}/articles/daily/spelling-details/${encodeURIComponent(nid)}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ message: 'Upstream error', status: upstream.status });
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (e) {
    console.error('fetchSpellingDetails error', e);
    return res.status(500).json({ message: 'Proxy error', error: e.message });
  }
}
