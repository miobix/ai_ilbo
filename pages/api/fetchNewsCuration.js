import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Missing date parameter" });

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-ai");
    const col = db.collection("yonhap");

    // Convert date format from YYYY-MM-DD to YYYYMMDD
    const dateFolder = date.replace(/-/g, '');

    const docs = await col
      .find(
        { date_folder: dateFolder },
        {
          projection: {
            _id: 0,
            datetime: 1,
            date_folder: 1,
            time_processed: 1,
            ai_results: 1,
            overall_assessment: 1,
            selection_reason: 1,
            total_articles_analyzed: 1,
            ai_source: 1,
            sources: 1
          }
        }
      )
      .sort({ datetime: -1 })
      .toArray();

    // Build SNS lookup: ContentID (SNS_XXXX) -> profile name
    const snsCol = db.collection("sns");
    const today = date.replace(/-/g, '');
    const snsDocs = await snsCol.find(
      { timestamp: { $regex: `^${date}` } },
      { projection: { _id: 0, sns_profile: 1, timestamp: 1 } }
    ).toArray();

    // Map index-based ID to profile (SNS_0001 = index 1)
    const snsProfileMap = {};
    snsDocs.forEach((doc, i) => {
      const id = `SNS_${String(i + 1).padStart(4, '0')}`;
      snsProfileMap[id] = doc.sns_profile || '';
    });

    // Inject profile into related_sources
    const enrichedDocs = docs.map(doc => ({
      ...doc,
      ai_results: doc.ai_results?.map(idea => ({
        ...idea,
        related_sources: idea.related_sources?.map(source => ({
          ...source,
          sns_profile: source.ContentID?.startsWith('SNS_') ? (snsProfileMap[source.ContentID] || '') : undefined
        }))
      }))
    }));

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ sessions: enrichedDocs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Route Error", error: err.message });
  } finally {
    await client.close();
  }
}