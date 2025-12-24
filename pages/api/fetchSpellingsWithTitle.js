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

    // Parse the date and create start/end of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find all spelling documents for the given date
    const spellingDocs = await spellingsCol.find({
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray();

    // Get all nids
    const nids = spellingDocs.map(doc => doc.nid);

    // Fetch titles from wms_data collection
    const wmsData = await wmsCol.find(
      { nid: { $in: nids } },
      { projection: { nid: 1, title: 1, _id: 0 } }
    ).toArray();

    // Create a map for quick lookup
    const titleMap = {};
    wmsData.forEach(item => {
      titleMap[item.nid] = item.title;
    });

    // Combine the data
    const articles = spellingDocs.map(doc => ({
      nid: doc.nid,
      title: titleMap[doc.nid] || "제목 없음",
      spellings: doc.spellings || [],
      mistakes_count: doc.mistakes_count || 0
    }));

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