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

    // Parse date to start and end of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const docs = await col
      .find(
        { datetime: { $gte: startDate, $lte: endDate } },
        { 
          projection: { 
            _id: 0, 
            datetime: 1,
            date_folder: 1,
            time_processed: 1,
            ai_results: 1,
            selection_reason: 1,
            total_articles_analyzed: 1
          } 
        }
      )
      .sort({ datetime: -1 })
      .toArray();

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ sessions: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Route Error", error: err.message });
  } finally {
    await client.close();
  }
}