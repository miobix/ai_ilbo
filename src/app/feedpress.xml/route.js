import RSS from "rss"

export async function GET() {

    const feed = new RSS({
        title: 'YeongnamAI',
        description: 'AI news from YeongnamIlbo',
        generator: 'RSS for Node and Next.js',
        feed_url: 'https://yeongnam.ai/feedpress.xml', 
        site_url: 'https://yeongnam.ai',
        managingEditor: 'naturei.dev@gmail.com (NatureI)',
        webMaster: 'naturei.dev@gmail.com (NatureI)',
        language: 'ko-KR',
        pubDate: new Date().toUTCString(),
        ttl: 20,
    });

    try {
      const response = await fetch(`https://yeongnam.ai/api/fetchEmailPress`);
      if (!response.ok) {
          console.error("Failed to fetch from this category:", response.statusText);
          return new Response('Error fetching news', { status: 500 });
      }

      const allNews = await response.json();

      const limitedNews = allNews.slice(0, 20);

        limitedNews.forEach(item => {
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
      return new Response('Server error .', { status: 500 });
  }
}