import { verifySessionToken } from "@/lib/authSession";

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

  if (!payload) return res.status(401).json({ authenticated: false });

  return res.status(200).json({ authenticated: true, user: payload.sub, role: payload.role, exp: payload.exp });
}
