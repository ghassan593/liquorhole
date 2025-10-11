// pages/api/admin/logout.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Clear the admin_jwt cookie
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `admin_jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`
  );

  return res.status(200).json({ success: true, message: "Logged out" });
}
