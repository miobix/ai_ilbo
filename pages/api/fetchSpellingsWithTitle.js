import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Missing date parameter" });

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-visits");
    const spellingsCol = db.collection("spellings");
    const wmsCol = db.collection("wms_data");
    const fullDataCol = db.collection("full_data");

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const spellingDocs = await spellingsCol.find({
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray();

    const nids = spellingDocs.map(doc => doc.nid);
    const fullDataDocs = await fullDataCol.find(
      { nid: { $in: nids } },
      { projection: { nid: 1, newstitle: 1, newskey: 1, byline_gijaname: 1, _id: 0 } }
    ).toArray();

    const fullDataMap = {};
    fullDataDocs.forEach(item => {
      fullDataMap[item.nid] = {
        title: item.newstitle,
        newskey: item.newskey,
        author: item.byline_gijaname
      };
    });

    const nidsNotInFullData = nids.filter(nid => !fullDataMap[nid]);
    let wmsData = [];
    if (nidsNotInFullData.length > 0) {
      wmsData = await wmsCol.find(
        { nid: { $in: nidsNotInFullData } },
        { projection: { nid: 1, title: 1, byline_gijaname: 1, _id: 0 } }
      ).toArray();
    }

    // fallback
    const wmsDataMap = {};
    wmsData.forEach(item => {
      wmsDataMap[item.nid] = {
        title: item.title,
        author: item.byline_gijaname,
        newskey: null
      };
    });

    // Combine the data
    const articles = spellingDocs.map(doc => {
      // Try full_data first, then wms_data, then fallback
      const dataSource = fullDataMap[doc.nid] || wmsDataMap[doc.nid] || { title: "제목 없음", newskey: null };
      
      return {
        nid: doc.nid,
        title: dataSource.title,
        newskey: dataSource.newskey,
        author: dataSource.author,
        spellings: doc.spellings || [],
        mistakes_count: doc.mistakes_count || 0
      };
    });

    // Calculate total count
    const totalCount = articles.reduce((sum, article) => sum + article.mistakes_count, 0);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      date,
      totalCount,
      articles
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Route Error", error: err.message });
  } finally {
    await client.close();
  }
}