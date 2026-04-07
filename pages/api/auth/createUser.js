import { verifySessionToken } from "@/lib/authSession";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

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
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies.yn_session;
  const payload = await verifySessionToken(token);

  if (!payload || payload.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }

  const { username, password, email = "", role = "", real_name = "" } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "사용자명과 비밀번호는 필수입니다." });
  }

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-ai");
    const users = db.collection("users");

    // Check if username already exists
    const existing = await users.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "이미 존재하는 사용자명입니다." });
    }

    const pw_hash = await bcrypt.hash(password, 10);
    const created_time = new Date();

    await users.insertOne({
      username,
      pw_hash,
      email,
      role,
      real_name,
      created_time,
    });

    return res.status(201).json({ message: "사용자가 생성되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  } finally {
    await client.close();
  }
}