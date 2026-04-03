import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-ai");
    const col = db.collection("Enterprise_article_views");

    const docs = await col
      .find({})
      .sort({ last_updated: -1 })
      .toArray();

    const serialized = docs.map((doc) => ({
      newskey: doc.newskey,
      title: doc.title,
      url: doc.url,
      history: (doc.history || []).map((h) => ({
        date: h.date,
        ref: h.ref,
        updated_at: h.updated_at,
      })),
      last_updated: doc.last_updated,
    }));

    return res.status(200).json(serialized);
  } catch (e) {
    console.error("fetchEnterpriseArticleViews error:", e);
    return res.status(500).json({ message: e.message });
  } finally {
    await client.close();
  }
}
