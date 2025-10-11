// pages/cart.js
import { useCart } from "../context/CartContext";
import Navigation from "../components/Navigation";
import { useState } from "react";
import Toast from "../components/Toast";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, getTotal } = useCart();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "", // optional field
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone || !customer.email || !customer.address) {
      showToast("Please fill in all required customer info.", "error");
      return;
    }

    if (cart.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    // Prepare cart items text
    const itemsText = cart
      .map((i) => `- ${i.name} x${i.quantity} = $${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");

    const whatsappMsg = encodeURIComponent(
     ` 🛒 New Order!\n\nName: ${customer.name}\nPhone: ${customer.phone}\nAddress: ${customer.address}\nNotes: ${customer.notes || "None"}\n\nItems:\n${itemsText}\n\nTotal: $${getTotal().toFixed(2)}`
    );

    const whatsappUrl = `https://wa.me/96181377374?text=${whatsappMsg}`;
    window.open(whatsappUrl, "_blank");

    setLoading(true);

    try {
      const res = await fetch("/api/sendOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customer.name,
          phoneNumber: customer.phone,
          customerEmail: customer.email,
          address: customer.address,
          notes: customer.notes,
          itemsText,
          items: cart,
          total: getTotal(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      clearCart();
      setCustomer({ name: "", phone: "", email: "", address: "", notes: "" });
      showToast("Order placed successfully! A confirmation email will be sent to you shortly");
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <section style={styles.container}>
        <h2 style={styles.title}>Your Cart</h2>

        {cart.length === 0 ? (
          <p style={styles.empty}>Your cart is empty.</p>
        ) : (
          <div style={styles.grid}>
            {/* Cart Items */}
            <div style={styles.cartItems}>
              {cart.map((item) => (
                <div key={item.id} style={styles.cartItem}>
                  <div style={styles.itemLeft}>
                    <img
                      src={item.image_url || "/placeholder.png"}
                      alt={item.name}
                      style={styles.image}
                    />
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemPrice}>${Number(item.price || 0).toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={styles.itemRight}>
                    <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <div style={styles.quantity}>{item.quantity}</div>
                    <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <div style={styles.totalPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                    <button style={styles.removeBtn} onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Info */}
            <div style={styles.infoBox}>
              <h3 style={styles.subtitle}>Customer Info</h3>
              <input
                type="text"
                placeholder="Name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Phone"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                style={styles.input}
              />
              <textarea
                placeholder="Address"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                style={{ ...styles.input, minHeight: 80 }}
              />
              <textarea
                placeholder="Notes (optional)"
                value={customer.notes}
                onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                style={{ ...styles.input, minHeight: 60 }}
              />
            </div>

            {/* Checkout */}
            <div style={styles.checkoutBox}>
              <div style={styles.totalText}>Total: ${getTotal().toFixed(2)}</div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  ...styles.checkoutBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Placing Order..." : "Checkout"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/*COD notice */}
      <div style={styles.codNotice}>
        Payment method: <strong>Cash on Delivery</strong>
      </div>

     
      





      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            padding: 0 10px;
          }
          .cart-item {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .item-right {
            margin-top: 10px;
            flex-wrap: wrap;
            gap: 10px;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  codNotice: {
  marginTop: 8,
  fontSize: 14,
  color: "#333",
  fontStyle: "italic",
  backgroundColor: "#fff3cd", // subtle yellow background
  padding: "6px 20px ",
  borderRadius: 6,
  border: "1px solid #ffeeba",
  textAlign: "center",
},
  container: { maxWidth: 1200, margin: "20px 0px", padding: "0 10px" },
  title: { marginBottom: 16, fontSize: 26, fontWeight: 700 },
  empty: { color: "#666" },
  grid: { display: "grid", gap: 20 },
  cartItems: { display: "flex", flexDirection: "column", gap: 16 },
  cartItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    border: "1px solid #eee",
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  itemLeft: { display: "flex", alignItems: "center", gap: 12 },
  image: { width: 70, height: 70, objectFit: "cover", borderRadius: 8 },
  itemName: { fontWeight: 700, fontSize: 16 },
  itemPrice: { color: "#666", fontSize: 14 },
  itemRight: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: {
    background: "#f0f0f0",
    border: "none",
    width: 30,
    height: 30,
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 700,
  },
  quantity: { minWidth: 20, textAlign: "center" },
  totalPrice: { width: 90, textAlign: "right", fontWeight: 700 },
  removeBtn: {
    color: "#c33",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  },
  infoBox: {
    padding: 16,
    border: "1px solid #eee",
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  subtitle: { marginBottom: 10, fontWeight: 700 },
  input: {
    width: "100%",
    padding: "10px 12px",
    margin: "6px 0",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  checkoutBox: { textAlign: "right" },
  totalText: { fontSize: 18, fontWeight: 700, marginBottom: 12 },
  checkoutBtn: {
    padding: "12px 20px",
    backgroundColor: "#d4af37",
    color: "#000",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    transition: "0.3s",
  },
};
