import { verifySessionToken } from "@/lib/authSession";
import { MongoClient } from "mongodb";

function parseCookie(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((chunk) => {
    const [k, ...rest] = chunk.trim().split("=");
    if (!k) return;
    out[k] = rest.join("=");
  });
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies.yn_session;
  const payload = await verifySessionToken(token);

  if (!payload) return res.status(401).json({ message: "인증이 필요합니다." });

  const { username } = req.query || {};
  if (!username) return res.status(400).json({ message: "사용자명을 지정하세요." });

  // Only allow viewing own profile or admin
  if (payload.sub !== username && payload.role !== "admin") {
    return res.status(403).json({ message: "권한이 없습니다." });
  }

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-ai");
    const users = db.collection("users");
    const user = await users.findOne({ username }, { projection: { pw_hash: 0 } });

    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  } finally {
    await client.close();
  }
}