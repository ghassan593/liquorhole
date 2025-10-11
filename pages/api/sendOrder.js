import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { customerName, phoneNumber, customerEmail, itemsText, items, total,address,notes } = req.body;

  // --- Insert order into Supabase ---
  try {
    const { data, error } = await supabase.from("orders").insert([
      {
        customer_name: customerName,
        phone_number: phoneNumber,
        email: customerEmail,
        customer_address: address,
        items: JSON.stringify(items),
        total_price: total,
        status: "pending",
        notes: notes,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save order" });
    }
  } catch (err) {
    console.error("Supabase error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  // --- Setup Gmail SMTP ---
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // business email
      pass: process.env.EMAIL_PASS, // app password
    },
  });

  // --- Email to Admin ---
  const adminMailOptions = {
    from: `"Liquor Hole Orders" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL, // admin email
    subject: "New Order Received",
    text: `Order from: ${customerName}\nPhone:${phoneNumber}\nEmail: ${customerEmail}\nAddress: ${address}\nNote: ${notes}\n\nItems:\n${itemsText}\n\nTotal: $${total}`,
  };

  // --- Confirmation Email to Customer ---
  const customerMailOptions = {
    from: `"Liquor Hole" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: "Your Liquor Hole Order Confirmation",
    text: `Hi ${customerName},\n\nThank you for your order!\n\nHere are the details:\n${itemsText}\n\nTotal: $${total}\n\nWe’ll contact you soon for delivery.\n\nCheers,\nLiquor Hole 🍾`,
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(customerMailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Email failed" });
  }
}
