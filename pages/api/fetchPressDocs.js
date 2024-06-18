//retrieves data from db

import { MongoClient } from 'mongodb';

export default async function fetchPressDocs(req, res) {
   
  if (req.method === 'GET') {
    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
      const database = client.db('yeongnam-ai'); 
      const collection = database.collection('report_docs');
      const data = await collection
        .find({ summary_id: { $exists: true }, engine: "gpt-4-turbo" })
        .toArray();
      const reversedData = data.reverse();

      const summaryIds = reversedData.map(item => item.summary_id);

      const summariesCollection = database.collection('summaries');
      const summaries = await summariesCollection.find({ _id: { $in: summaryIds } }).toArray();

      const mergedData = reversedData.map(item => {
        const summary = summaries.find(summary => summary._id.equals(item.summary_id));
        return { ...item, summary };
      });

      // Validate items to send back
      const validatedData = mergedData.filter(item => 
        item.summary_id &&
        item.summary &&
        !Array.isArray(item.summary.article_body) &&
        Array.isArray(item.summary.key_takeaways)
      );

      res.status(200).json(validatedData);
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
