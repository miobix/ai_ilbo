import { MongoClient } from "mongodb";

export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({message:'Method not allowed'});
  const client=new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try{
    await client.connect();
    const db=client.db("yeongnam-visits");
    const col=db.collection("wms_data");
    const threeMonthsAgo=new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth()-3);
  // const projection={ _id:1,nid:1,service_daytime:1,title:1,writers:1,writer_buseo:1,level:1,embargo_type:1,reg_dt:1,reg_id:1,art_org_class:1,last_update:1};
   const projection={ _id:1,nid:1,service_daytime:1,title:1,writers:1,writer_buseo:1,level:1,embargo_type:1,reg_dt:1,reg_id:1,art_org_class:1,last_update:1,spellings:1 };

    const docs=await col.find({ service_daytime:{ $gte: threeMonthsAgo }, title:{ $exists:true } }).project(projection).sort({ service_daytime:-1 }).toArray();

    const prune = (obj)=>{
      const out={};
      for(const [k,v] of Object.entries(obj)){
        if(v===undefined || v===null) continue;
        if(typeof v==='string' && v.trim()==='') continue;
        if(Array.isArray(v) && v.length===0) continue;
        out[k]=v;
      }
      return out;
    };

    const normalized=docs.map(a=>{
      // writer_buseo가 없을 경우 writers 배열에서 유추
      let writerBuseo = a.writer_buseo;
      if(!writerBuseo && Array.isArray(a.writers)){
        const pickFields = (w)=> w?.buseo || w?.buseo_name || w?.dept || w?.department;
        const buseoList = Array.from(new Set(a.writers.map(pickFields).filter(Boolean)));
        if(buseoList.length) writerBuseo = buseoList.join(', ');
      }
      const obj = {
        _id: a._id,
        newskey: a.nid || a._id,
        newsdate: a.service_daytime,
        newstitle: a.title,
        writers: a.writers,
        writer_buseo: writerBuseo,
        level: a.level || "5",
        embargo_type: a.embargo_type,
        reg_dt: a.reg_dt,
        reg_id: a.reg_id,
        art_org_class: a.art_org_class,
        last_update: a.last_update,
        spellings: a.spellings,
      };
      return prune(obj);
    });
    if(normalized.length===0) return res.status(204).end();
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json(normalized);
  }catch(err){
    console.error(err);
    return res.status(500).json({message:'Route Error', error:err.message});
  }finally{ await client.close(); }
}
