import { verifySessionToken } from "@/lib/authSession";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

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

  if (!payload) return res.status(401).json({ message: "인증이 필요합니다." });

  const { username, current_password, new_username, new_password, email, real_name } = req.body || {};
  if (!username) return res.status(400).json({ message: "사용자명을 지정하세요." });

  // Only allow updating own profile or admin
  if (payload.sub !== username && payload.role !== "admin") {
    return res.status(403).json({ message: "권한이 없습니다." });
  }

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-ai");
    const users = db.collection("users");
    const user = await users.findOne({ username });

    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    const updates = {};

    // If changing password, verify current password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ message: "현재 비밀번호를 입력하세요." });
      }
      const isValid = await bcrypt.compare(current_password, user.pw_hash);
      if (!isValid) {
        return res.status(401).json({ message: "현재 비밀번호가 올바르지 않습니다." });
      }
      updates.pw_hash = await bcrypt.hash(new_password, 10);
    }

    // Check new username uniqueness if changing
    if (new_username && new_username !== username) {
      const existing = await users.findOne({ username: new_username });
      if (existing) {
        return res.status(409).json({ message: "이미 존재하는 사용자명입니다." });
      }
      updates.username = new_username;
    }

    // Update other fields
    if (email !== undefined) updates.email = email;
    if (real_name !== undefined) updates.real_name = real_name;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "변경할 내용이 없습니다." });
    }

    await users.updateOne({ username }, { $set: updates });

    // If username changed, need to update session? For now, assume user logs out or handles it
    return res.status(200).json({ message: "프로필이 업데이트되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  } finally {
    await client.close();
  }
}