// GET /api/fetchDailyTotals?date=YYYY-MM-DD
// Proxies to external daily totals API using server-side bearer token.

export default async function handler(req, res) {
  console.log('🔄 fetchDailyTotals API 호출됨');
  
  if (req.method !== 'GET') {
    console.log('❌ 허용되지 않은 메서드:', req.method);
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { date } = req.query;
    console.log('📅 요청된 날짜:', date);
    
    if (!date) {
      console.log('❌ 날짜 파라미터 누락');
      return res.status(400).json({ error: 'Missing required query param: date (YYYY-MM-DD)' });
    }

    const baseUrl = process.env.NEXT_PUBLIC_AI_SERVER_BASE_URL;
    const token = process.env.NEXT_PUBLIC_NAMGYU_FAST_API_KEY.trim();
    
    console.log('🔧 설정 확인:');
    console.log('  - Base URL:', baseUrl);
    console.log('  - Token 설정:', token ? '설정됨' : '설정안됨');
    console.log('  - NEXT_PUBLIC_AI_SERVER_BASE_URL:', process.env.NEXT_PUBLIC_AI_SERVER_BASE_URL ? '설정됨' : '설정안됨');
    console.log('  - NEXT_PUBLIC_NAMGYU_FAST_API_KEY:', process.env.NEXT_PUBLIC_NAMGYU_FAST_API_KEY ? '설정됨' : '설정안됨');
    
    if (!token) {
      console.log('❌ 토큰이 설정되지 않음');
      return res.status(500).json({ error: 'Server not configured: set DAILY_TOTALS_TOKEN or NEXT_PUBLIC_NAMGYU_FAST_API_KEY' });
    }

    const url = `${baseUrl.replace(/\/$/, '')}/articles/daily/totals?date=${encodeURIComponent(date)}`;
    console.log('🌐 외부 API 요청 URL:', url);
    console.log('🔌 외부 API 호출 시작...');
    console.log('🔌 외부 API 호출 시작...');
    
    const rsp = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
  'Authorization': `Bearer ${token}`,
      },
      // 10s timeout via AbortController
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
    });

    console.log('📡 외부 API 응답 상태:', rsp.status, rsp.statusText);

    if (!rsp.ok) {
      const text = await rsp.text();
      console.log('❌ 외부 API 에러 응답:', text);
      return res.status(rsp.status).json({ error: 'Upstream error', status: rsp.status, body: text });
    }
    
    const data = await rsp.json();
    console.log('✅ 외부 API 성공, 데이터 타입:', typeof data, ', 배열 여부:', Array.isArray(data));
    console.log('📊 데이터 개수/크기:', Array.isArray(data) ? data.length : Object.keys(data || {}).length);
    
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ fetchDailyTotals 에러 발생:');
    console.error('에러 타입:', err.constructor.name);
    console.error('에러 메시지:', err.message);
    console.error('에러 스택:', err.stack);
    
    return res.status(500).json({ 
      error: err.message || 'Internal Server Error',
      errorType: err.constructor.name
    });
  }
}
