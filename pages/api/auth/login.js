import { createSessionToken, SESSION_TTL_SECONDS } from "@/lib/authSession";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

function cookieString(name, value, maxAgeSeconds) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { id, pw } = req.body || {};
  if (!id || !pw) {
    return res.status(400).json({ message: "아이디와 비밀번호를 입력하세요." });
  }

  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("yeongnam-ai");
    const users = db.collection("users");
    const user = await users.findOne({ username: id });
    if (!user || !(await bcrypt.compare(pw, user.pw_hash))) {
      return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    const token = await createSessionToken(user);
    res.setHeader("Set-Cookie", cookieString("yn_session", token, SESSION_TTL_SECONDS));
    return res.status(200).json({ ok: true, user: { id: user.username, role: user.role, real_name: user.real_name } });
  } catch (error) {
    console.error("Login error:", error.message, error.stack);
    return res.status(500).json({ message: "서버 오류", error: error.message });
  } finally {
    await client.close();
  }
}
