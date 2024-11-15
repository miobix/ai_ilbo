import RSS from "rss"
import {getExternalImageSource} from  '../utils/common'

export async function GET() {

    const feed = new RSS({
        title: '영남일보 - 전체기사',
        description: '영남일보 전체기사 RSS',
        generator: 'RSS for Node and Next.js',
        feed_url: 'https://yeongnam.ai/feed.xml', 
        site_url: 'https://yeongnam.ai',
        managingEditor: 'naturei.dev@gmail.com (NatureI)',
        webMaster: 'naturei.dev@gmail.com (NatureI)',
        language: 'ko-KR',
        pubDate: new Date().toUTCString(),
        ttl: 20,
        custom_namespaces: {
            atom: 'http://www.w3.org/2005/Atom',
            media: 'http://search.yahoo.com/mrss/',
            mi: 'http://schemas.ingestion.microsoft.com/common/',
            dc: 'http://purl.org/dc/elements/1.1/',
            content: 'http://purl.org/rss/1.0/modules/content/',
            dcterms: 'http://purl.org/dc/terms/'
        }
    });

    try {
      const response = await fetch(`https://yeongnam.ai/api/fetchAllPress`);
      //const response = await fetch(`http://localhost:3000/api/fetchAllPress`);
      if (!response.ok) {
          console.error("Failed to fetch from fetchAllPress:", response.statusText);
          return new Response('Error fetching news', { status: 500 });
      }

      const allNews = await response.json();

      const limitedNews = allNews.slice(0, 30);

      limitedNews.forEach(item => {
        const formattedDate = new Date(item.timestamp.replace(" ", "T")).toUTCString();
        let imageSource = getExternalImageSource(item)
        feed.item({
            title: item.summary.title || 'Default Title',
            description: item.summary.article_body.replaceAll('##','<br>') || 'No description provided', 
            url: `https://yeongnam.ai/article/${item._id}` || 'Error on retrieving link', 
            date: formattedDate || new Date().toUTCString(), 
            custom_elements: [
            {
                'media:content': {
                    _attr: {
                        url: imageSource,
                        type: 'image/jpeg',
                        medium: "image"
                        //width: '800',
                        //height: '600'
                    }
                }
            }
            ]
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