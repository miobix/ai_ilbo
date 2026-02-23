import { MongoClient } from "mongodb";
import { allowed_reporters } from "@/app/utils/repotersList";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  function splitReporters(byline) {
    if (!byline || typeof byline !== "string") return [byline];

    const reporters = byline
      .split(/[·,]/) // Split by · or ,
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (reporters.length <= 1) return [byline];

    return reporters;
  }

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-visits");
    const col = db.collection("full_data");
    const { from, to } = req.query || {};
    let dateFilter = {};
    if (from && to) {
      dateFilter = { newsdate: { $gte: new Date(from), $lte: new Date(to) } };
    } else {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      dateFilter = { newsdate: { $gte: sixMonthsAgo } };
    }
    const projection = { newsdate: 1, newskey: 1, code_name: 1, byline_gijaname: 1, buseid: 1, newstitle: 1, ref: 1, level: 1, external_daum: 1, ref_daum: 1, ref_etc: 1, ref_naver: 1, ref_google: 1, ref_mobile: 1, ref_web:1 };
    const docs = await col
      .find({ ref: { $exists: true, $ne: null, $ne: 0 }, delete: 0, ...dateFilter })
      .project(projection)
      .sort({ newsdate: -1 })
      .toArray();
    const docsWithSummedRef = docs.map((doc) => ({
      ...doc,
      ref: (doc.ref || 0) + (doc.external_daum || 0),
      ref_daum: (doc.ref_daum || 0) + (doc.external_daum || 0),
    }));
    // const normalized = docs.map((a) => ({ ...a, newsdate: new Date(new Date(a.newsdate).toDateString()).toISOString(), level: a.level || "5" }));
    const normalized = docsWithSummedRef.flatMap((a) => {
      let byLine = a.byline_gijaname;
      //from reporters like 글·사진=노진실기자 know@yeongnam.com, remove the '글·사진=' part. There might be multiple '=' signs
      const equalSignIndex = byLine.indexOf("=");
      if (equalSignIndex !== -1) {
        byLine = byLine.substring(equalSignIndex + 1).trim();
      }
      //remove any trailing '기자' suffix but not '시민기자' suffix
      byLine = byLine.replace(/(?<!시민)기자/g, "").trim();

      // also remove the email part
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

      byLine = byLine.replace(emailRegex, '').trim();

      const reporters = splitReporters(byLine);

      return reporters.map((reporter) => ({
        ...a,
        newsdate: new Date(new Date(a.newsdate).toDateString()).toISOString(),
        level: a.level || "5",
        byline_gijaname: allowed_reporters.includes(reporter) ? reporter : "외부기고",
      }));
    });

    if (!normalized.length) return res.status(204).end();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(normalized);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Route Error", error: err.message });
  } finally {
    await client.close();
  }
}
