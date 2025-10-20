import { MongoClient } from "mongodb";

export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({message:'Method not allowed'});
  const client=new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try{
    const leadTimeMonths = 2
    await client.connect();
    const db=client.db("yeongnam-visits");
    const col=db.collection("homepage_visits");
    const monthsAgo=new Date();
    monthsAgo.setMonth(monthsAgo.getMonth()-leadTimeMonths);
    const monthsAgoStr = monthsAgo.toISOString().slice(0, 10).replace(/-/g, '');

    const projection={ _id:0,pagePath:1,date:1,pageViews:1,activeUsers:1 };

    const docs=await col.find({ date:{ $gte: monthsAgoStr }, pagePath:{ $exists:true } }).project(projection).sort({ date:1 }).toArray();

// Grouping logic
    const grouped = {
      total: [],
      homeDesktop: [],
      homeMobile: [],
      // sectionDesktop: [],
      // viewDesktop: [],
      // sectionMobile: [],
      // viewMobile: [],
    };

    for (const doc of docs) {
      const { pagePath, date, pageViews, activeUsers } = doc;

      if (pagePath === "total") {
        grouped.total.push(doc);
      } else if (["/web/", "/web/index.php", "/"].includes(pagePath)) {
         if (!grouped.homeDesktop[date]) {
           grouped.homeDesktop[date] = {
             pagePath: "/web",
             date: date,
             pageViews: 0,
             activeUsers: 0
           };
         }
         // Sum the pageViews for the date
         grouped.homeDesktop[date].pageViews += pageViews;
         grouped.homeDesktop[date].activeUsers += activeUsers; 
       } else if (pagePath === "/index.php") {
         grouped.homeMobile.push(doc);
      //  } else if (pagePath === "/web/section.php") {
      //    grouped.sectionDesktop.push(doc);
      //  } else if (pagePath === "/web/view.php") {
      //    grouped.viewDesktop.push(doc);
      //  } else if (pagePath === "/section.php") {
      //    grouped.sectionMobile.push(doc);
      //  } else if (pagePath === "/view.php") {
      //    grouped.viewMobile.push(doc);
       }
    }

     // Convert the homeDesktop object back to an array for consistent output format
     const finalGrouped = {
       ...grouped,
       homeDesktop: Object.values(grouped.homeDesktop).sort((a, b) => b.date.localeCompare(a.date))
     };

    //res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.setHeader("ETag", `"${Date.now()}"`);
    return res.status(200).json(finalGrouped);
  }catch(err){
    console.error(err);
    return res.status(500).json({message:'Route Error', error:err.message});
  }finally{ await client.close(); }
}
