import { MongoClient } from "mongodb";

export default async function fetchAllPress(req, res) {
  if (req.method === "GET") {
    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);

    try {
      await client.connect();
      const database = client.db("yeongnam-ai");
      
      // Fetch data from all categories
      const emailPressCollection = database.collection("email_press_docs");
      const reportDocsCollection = database.collection("report_docs");
      const snsCollection = database.collection("sns");

      // Fetch from each collection
      const [emailPressData, reportDocsData, snsData] = await Promise.all([
        emailPressCollection.find({ summary_id: { $exists: true }, zone: { $in: ["대구", "경북"] } }).limit(30).toArray(),
        reportDocsCollection.find({ summary_id: { $exists: true }, zone: { $in: ["Gov"] }, engine: { $in: ["gpt-4-turbo", "gpt-4o"] } }).limit(30).toArray(),
        snsCollection.find({ summary_id: { $exists: true } }).sort({ timestamp: -1 }).limit(30).toArray()
      ]);

      // Combine the data
      const allData = [...emailPressData, ...reportDocsData, ...snsData];

      // Fetch summaries
      const summaryIds = allData.map((item) => item.summary_id);
      const summariesCollection = database.collection("summaries");
      const summaries = await summariesCollection.find({ _id: { $in: summaryIds } }).toArray();

      // Merge data with summaries
      const mergedData = allData.map((item) => {
        const summary = summaries.find((summary) => summary._id.equals(item.summary_id));
        return { ...item, summary };
      });

      // Validate items to send back
      const validatedData = mergedData.filter(
        (item) => 
          item.summary_id && 
          item.summary && 
          !Array.isArray(item.summary.article_body &&
          (item.summary.key_takeaways === undefined || Array.isArray(item.summary.key_takeaways))
      ))


      // Sort by timestamp and limit to last 30 entries
      const sortedData = validatedData.sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);

      res.status(200).json(sortedData);
    } catch (error) {
      console.error(error); 
      res.status(500).json({ message: "Something went wrong" });
    } finally {
      await client.close();
    }
  } else {
    res.status(403).json({ message: "Method not allowed" });
  }
}
