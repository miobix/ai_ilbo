import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  const { nid } = req.query;
  console.log(nid)
  if (!nid) return res.status(400).json({ message: "Missing nid parameter" });

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-visits");
    const col = db.collection("spellings");

    const doc = await col.findOne(
      { nid },
      { projection: { _id: 0, original_text: 1, spellings: 1 } }
    );

    const result = {
      original_text: doc?.original_text || "",
      spellings: doc?.spellings || []
    };

    console.log(result);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Route Error", error: err.message });
  } finally {
    await client.close();
  }
}
