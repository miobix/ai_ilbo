import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: 'Method not allowed' });
  
  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db("yeongnam-visits");
    const col = db.collection("hourly_visits");
    
    // Get date parameter from query (optional)
    const { date, days } = req.query;
    
    let query = {};
    
    if (date) {
      // Specific date
      query.date = date;
    } else {
      // Default: last N days (default 7 days)
      const daysBack = parseInt(days) || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const startDateStr = startDate.toISOString().slice(0, 10).replace(/-/g, '');
      query.date = { $gte: startDateStr };
    }
    
    const projection = { _id: 0, pagePath: 1, date: 1, pageViews: 1, activeUsers: 1 };
    
    const docs = await col.find(query)
      .project(projection)
      .sort({ date: 1 })
      .toArray();
    
    // Grouping logic
    const grouped = {
      total: [],
      homeDesktop: {},
      homeMobile: [],
    };
    
    for (const doc of docs) {
      const { pagePath, date, pageViews, activeUsers } = doc;
      
      if (pagePath === "total") {
        grouped.total.push(doc);
      } else if (["/web/", "/"].includes(pagePath)) {
        if (!grouped.homeDesktop[date]) {
          grouped.homeDesktop[date] = {
            pagePath: "/web",
            date: date,
            pageViews: new Array(24).fill(0),
            activeUsers: new Array(24).fill(0)
          };
        }
        // Sum the pageViews and activeUsers for each hour
        for (let hour = 0; hour < 24; hour++) {
          grouped.homeDesktop[date].pageViews[hour] += (pageViews?.[hour] || 0);
          grouped.homeDesktop[date].activeUsers[hour] += (activeUsers?.[hour] || 0);
        }
      } else if (pagePath === "/index.php") {
        grouped.homeMobile.push(doc);
      }
    }
    
    // Convert the homeDesktop object back to an array
    const finalGrouped = {
      ...grouped,
      homeDesktop: Object.values(grouped.homeDesktop).sort((a, b) => a.date.localeCompare(b.date))
    };
    
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.setHeader("ETag", `"${Date.now()}"`);
    return res.status(200).json(finalGrouped);
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Route Error', error: err.message });
  } finally {
    await client.close();
  }
}
