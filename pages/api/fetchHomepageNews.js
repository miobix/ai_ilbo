//retrieves data from db

import { MongoClient } from 'mongodb';

export default async function fetchHomepageNews(req, res) {
   
  if (req.method === 'GET') {
    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);

    try {
      await client.connect();
      const database = client.db('yeongnam-ai'); 
      const collection = database.collection('selected_raw_items');
      // const data = await collection.find({}).toArray();
      const data = await collection.find({ summary_id: { $exists: true } }).sort({ read_date: -1 }).limit(20).toArray();

      //const reversedData = data.reverse();

       const summaryIds = data.map(item => item.summary_id);

      const summariesCollection = database.collection('summaries');
      const summaries = await summariesCollection.find({ _id: { $in: summaryIds } }).toArray();

      const mergedData = data.map(item => {
        const summary = summaries.find(summary => summary._id.equals(item.summary_id));
        return { ...item, summary };
      });

      // Validate items to send back
      const validatedData = mergedData.filter(item => 
        item.summary_id && 
        item.generated_img_url && 
        item.generated_img_url.original
      );

      res.status(200).json(validatedData.slice(0, 50));
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
