import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    const leadTimeMonths = 1;
    await client.connect();
    const db = client.db("yeongnam-visits");
    const col = db.collection("section_visits");
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - leadTimeMonths);
    const monthsAgoStr = monthsAgo.toISOString().slice(0, 10).replace(/-/g, "");

    const projection = { _id: 0, ncid: 1, pagePath: 1, date: 1, pageViews: 1, activeUsers: 1 };

    const docs = await col
      .find({
        date: { $gte: monthsAgoStr },
        pagePath: { $exists: true },
        ncid: { $ne: "(not set)" },
      })
      .project(projection)
      .sort({ date: 1 })
      .toArray();

    // Grouping logic
    const grouped = {
      total: [],
      desktop: {}, // { date: { ncid: { pageViews, activeUsers } } }
      mobile: {}, // { date: { ncid: { pageViews, activeUsers } } }
    };

    for (const doc of docs) {
      const { pagePath, date, pageViews, activeUsers, ncid } = doc;

      if (pagePath === "total") {
        grouped.total.push(doc);
        continue;
      }

      // Extract main category from ncid (e.g., "N04_02" -> "N04")
      const mainCategory = ncid ? ncid.split("_")[0] : null;

      if (!mainCategory) continue;

      // Determine if desktop or mobile
      const isDesktop = pagePath === "/web/section.php";
      const isMobile = pagePath === "/section.php";

      if (!isDesktop && !isMobile) continue;

      const target = isDesktop ? grouped.desktop : grouped.mobile;

      // Initialize date if not exists
      if (!target[date]) {
        target[date] = {};
      }

      // Initialize category if not exists
      if (!target[date][mainCategory]) {
        target[date][mainCategory] = {
          ncid: mainCategory,
          pageViews: 0,
          activeUsers: 0,
        };
      }

      // Aggregate pageViews and activeUsers
      target[date][mainCategory].pageViews += pageViews;
      target[date][mainCategory].activeUsers += activeUsers;
    }

    // Convert to array format sorted by date (descending)
    const finalGrouped = {
      total: grouped.total,
      desktop: Object.entries(grouped.desktop)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, categories]) => ({
          date,
          categories: Object.values(categories),
        })),
      mobile: Object.entries(grouped.mobile)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, categories]) => ({
          date,
          categories: Object.values(categories),
        })),
    };

    //res.setHeader('Cache-Control', 'no-store');
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.setHeader("ETag", `"${Date.now()}"`);
    return res.status(200).json(finalGrouped);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Route Error", error: err.message });
  } finally {
    await client.close();
  }
}
