import { createSessionToken, SESSION_TTL_SECONDS } from "@/lib/authSession";

const MASTER_ID = "yeongnami";
const MASTER_PW = "7575";

function cookieString(name, value, maxAgeSeconds) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { id, pw } = req.body || {};
  if (id !== MASTER_ID || pw !== MASTER_PW) {
    return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  const token = await createSessionToken(id);
  res.setHeader("Set-Cookie", cookieString("yn_session", token, SESSION_TTL_SECONDS));
  return res.status(200).json({ ok: true, user: { id } });
}
