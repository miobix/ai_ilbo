//retrieves data from db
import { MongoClient, ObjectId } from "mongodb";

export default async function articleId(req, res) {
  const articleId = req.query.articleId;
  if (req.method === "GET") {
    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);

    try {
      await client.connect();
      const database = client.db("yeongnam-ai");
      const collection = database.collection("email_press_docs");
      let data = await collection.findOne({ _id: new ObjectId(articleId) });

      if (!data) {
        // If article is not found in "selected_raw_items", search in "report_docs" collection
        const reportDocsCollection = database.collection("report_docs");
        data = await reportDocsCollection.findOne({ _id: new ObjectId(articleId) });

        if (!data) {
          // If article is not found in "selected_raw_items", search in "report_docs" collection
          const reportDocsCollection = database.collection("sns");
          data = await reportDocsCollection.findOne({ _id: new ObjectId(articleId) });
        }
      }

      if (data) {
        const summaryId = data.summary_id;
        const summariesCollection = database.collection("summaries");
        const summary = await summariesCollection.findOne({ _id: summaryId });

        const mergedData = { ...data, summary };

        res.status(200).json(mergedData);
      } else {
        res.status(404).json({ message: "Article not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
