// pages/api/admin/login.js
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Missing password" });

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

  if (!ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
    console.error("Admin env vars missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }

  // Create JWT token (4 hours)
  const token = jwt.sign({ role: "admin" }, ADMIN_JWT_SECRET, { expiresIn: "4h" });

  // Set HttpOnly cookie
  const maxAge = 4 * 60 * 60; // seconds
  const isProduction = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `admin_jwt=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${isProduction ? "; Secure" : ""}`
  );

  return res.status(200).json({ success: true });
}
