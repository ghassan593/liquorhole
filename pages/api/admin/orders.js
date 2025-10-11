// pages/api/admin/orders.js
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { parse } from "cookie";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    // --- Parse cookies safely ---
    const cookieHeader = req.headers?.cookie || "";
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.admin_jwt;

    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    // Verify JWT
    try {
      jwt.verify(token, ADMIN_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // --- GET: Fetch all orders ---
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch orders error:", error);
        return res.status(500).json({ error: "Error fetching orders" });
      }

      return res.status(200).json({ orders: data });
    }

    // --- PATCH: Update order status ---
    if (req.method === "PATCH") {
      const { id, status } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: "Missing id or status" });
      }

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) {
        console.error("Supabase update order error:", error);
        return res.status(500).json({ error: "Failed to update order" });
      }

      return res.status(200).json({ success: true });
    }

    // --- Method not allowed ---
    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).end();
  } catch (err) {
    console.error("admin/orders API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
