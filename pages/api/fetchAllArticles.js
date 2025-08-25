import { MongoClient } from "mongodb";

export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({message:'Method not allowed'});
  const client=new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try{
    await client.connect();
    const db=client.db("yeongnam-visits");
    const col=db.collection("full_data");
    const { from, to, limit='50000' } = req.query || {};
    let dateFilter={};
    if(from && to){ dateFilter={ newsdate:{ $gte:new Date(from), $lte:new Date(to) } }; }
    else { const sixMonthsAgo=new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6); dateFilter={ newsdate:{ $gte:sixMonthsAgo } }; }
    const projection={ newsdate:1, newskey:1, code_name:1, byline_gijaname:1, buseid:1, newstitle:1, ref:1, level:1 };
    const docs=await col.find({ ref:{ $exists:true, $ne:null, $ne:0 }, ...dateFilter }).project(projection).sort({ newsdate:-1 }).limit(parseInt(limit)).toArray();
    const normalized=docs.map(a=>({ ...a, newsdate:new Date(new Date(a.newsdate).toDateString()).toISOString(), level:a.level||'5' }));
    if(!normalized.length) return res.status(204).end();
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json(normalized);
  }catch(err){
    console.error(err);
    return res.status(500).json({message:'Route Error', error:err.message});
  }finally{ await client.close(); }
}
