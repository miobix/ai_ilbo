import RSS from "rss"

export async function GET() {

    const feed = new RSS({
        title: 'YeongnamAI',
        description: 'AI news from YeongnamIlbo',
        generator: 'RSS for Node and Next.js',
        feed_url: 'https://yeongnam.ai/feed.xml', 
        site_url: 'https://yeongnam.ai',
        managingEditor: 'naturei.dev@gmail.com (NatureI)',
        webMaster: 'naturei.dev@gmail.com (NatureI)',
        language: 'ko-KR',
        pubDate: new Date().toUTCString(),
        ttl: 2,
    });
    // ${req.nextUrl.origin}
    try {
      //const response = await fetch(`https://yeongnam.ai/api/fetchAllPress`);
      const response = await fetch(`http://localhost:3000/api/fetchAllPress`);
      if (!response.ok) {
          console.error("Failed to fetch from fetchAllPress:", response.statusText);
          return new Response('Error fetching news', { status: 500 });
      }

      const allNews = await response.json();


      allNews.forEach(item => {
        const formattedDate = new Date(item.timestamp.replace(" ", "T")).toUTCString();
          feed.item({
              title: item.summary.title || 'Default Title',
              description: item.summary.article_body || 'No description provided', 
              url: `https://yeongnam.ai/article/${item._id}` || 'Error on retrieving link', 
              date: formattedDate || new Date().toUTCString(), 
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