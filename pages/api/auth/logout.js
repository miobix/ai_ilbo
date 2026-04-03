function clearCookie(name) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  res.setHeader("Set-Cookie", clearCookie("yn_session"));
  return res.status(200).json({ ok: true });
}
