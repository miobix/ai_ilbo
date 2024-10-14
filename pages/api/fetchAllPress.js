import { MongoClient } from "mongodb";

export default async function fetchAllPress(req, res) {
  if (req.method === "GET") {
    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);

    try {
      await client.connect();
      const database = client.db("yeongnam-ai");
      
      // Fetch latest data from each collection individually
      const emailPressCollection = database.collection("email_press_docs");
      const reportDocsCollection = database.collection("report_docs");
      const snsCollection = database.collection("sns");
      
      // Fetch and sort by timestamp, limiting results to 30
      const emailPressData = await emailPressCollection
        .find({ summary_id: { $exists: true }, zone: { $in: ["대구", "경북"] } })
        .sort({ _id: -1 }) // Sort by latest
        .limit(40)
        .toArray();
      
      const congressPressData = await emailPressCollection
        .find({ summary_id: { $exists: true }, zone: { $in: ["의원실"] } })
        .sort({ _id: -1 })
        .limit(40)
        .toArray();
      
      const reportDocsData = await reportDocsCollection
        .find({ summary_id: { $exists: true }, zone: { $in: ["Gov"] }, engine: { $in: ["gpt-4-turbo", "gpt-4o"] } })
        .sort({ _id: -1 })
        .limit(40)
        .toArray();
      
      const snsData = await snsCollection
        .find({ summary_id: { $exists: true } })
        .sort({ _id: -1 })
        .limit(40)
        .toArray();

      // Combine the latest data from each category
      const allData = [...emailPressData, ...congressPressData, ...reportDocsData, ...snsData];
      //const allData = [ ...emailPressData]
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
            item.summary && 
            item.summary_id && 
            !Array.isArray(item.summary.article_body)
      );

      // Sort by timestamp again and limit to last 30 entries
      const sortedData = validatedData.sort((a, b) => a.timestamp - b.timestamp);

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