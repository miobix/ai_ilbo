import RSS from 'rss';

export async function GET(req) {

    const feed = new RSS({
        title: 'YeongnamAI',
        description: 'AI news from YeongnamIlbo',
        generator: 'RSS for Node and Next.js',
        feed_url: `${req.nextUrl.origin}/feed.xml`, // Use req.nextUrl.origin for dynamic URLs
        site_url: req.nextUrl.origin,
        managingEditor: 'naturei.dev@gmail.com (NatureI)',
        webMaster: 'naturei.dev@gmail.com (NatureI)',
        language: 'ko-KR',
        pubDate: new Date().toUTCString(),
        ttl: 60,
    });

    try {
      const response = await fetch(`${req.nextUrl.origin}/api/fetchAllPress`);

      if (!response.ok) {
          console.error("Failed to fetch from fetchAllPress:", response.statusText);
          return new Response('Error fetching news', { status: 500 });
      }

      const allNews = await response.json();

      allNews.forEach(item => {
        // console.log(item.summary.title)
        // console.log(item.summary.article_body)
        // console.log(`https://yeongnam.ai/article/${item._id}`)
        // console.log(item.timestamp)

          feed.item({
              title: item.summary.title || 'Default Title',
              description: item.summary.article_body || 'No description provided', 
              url: `https://yeongnam.ai/article/${item._id}` || 'Error on retrieving link', 
              date: item.timestamp || new Date().toUTCString(), 
          });
          
      });

      const xml = feed.xml({ indent: true });
      return new Response(xml, {
          headers: {
              'Content-Type': 'application/xml; charset=utf-8',
          },
      });

  } catch (error) {
      console.error("Error in GET handler:", error);
      return new Response('Server error', { status: 500 });
  }
}