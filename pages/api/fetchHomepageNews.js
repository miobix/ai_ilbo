//retrieves data from db

import { MongoClient } from 'mongodb';

export default async function fetchHomepageNews(req, res) {
   
  if (req.method === 'GET') {
    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
      const database = client.db('yeongnam-ai'); 
      const collection = database.collection('selected_raw_items');
      const data = await collection.find({}).toArray();
      const reversedData = data.reverse();

       // Extract summary IDs from the fetched data
       const summaryIds = reversedData.map(item => item.summary_id);
       // Fetch summaries from the 'summaries' collection based on the summary IDs
      const summariesCollection = database.collection('summaries');
      const summaries = await summariesCollection.find({ _id: { $in: summaryIds } }).toArray();
      // Combine the fetched data with the summaries
      const mergedData = reversedData.map(item => {
        const summary = summaries.find(summary => summary._id.equals(item.summary_id));
        return { ...item, summary };
      });

      res.status(200).json(mergedData);
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
