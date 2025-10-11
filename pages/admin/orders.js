// pages/admin/orders.js
import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  async function checkAuthAndFetch() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 200) {
        const data = await res.json();
        setOrders(data.orders || []);
        setLoggedIn(true);
      } else if (res.status === 401) {
        setLoggedIn(false);
      } else {
        setError("Failed to fetch orders");
        setLoggedIn(false);
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        await checkAuthAndFetch();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        setLoggedIn(false);
        setOrders([]);
        setPassword("");
      } else {
        setError("Logout failed");
      }
    } catch (err) {
      console.error(err);
      setError("Logout error");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRefresh() {
    await checkAuthAndFetch();
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.phone_number.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const orderDate = new Date(order.created_at);
    const matchesStartDate = startDate ? orderDate >= new Date(startDate) : true;
    const matchesEndDate = endDate ? orderDate <= new Date(endDate + "T23:59:59") : true;
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortBy) return 0;
    switch (sortBy) {
      case "date_desc":
        return new Date(b.created_at) - new Date(a.created_at);
      case "date_asc":
        return new Date(a.created_at) - new Date(b.created_at);
      case "total_desc":
        return b.total_price - a.total_price;
      case "total_asc":
        return a.total_price - b.total_price;
      case "status_asc":
        return a.status.localeCompare(b.status);
      case "status_desc":
        return b.status.localeCompare(a.status);
      default:
        return 0;
    }
  });

  // Status summary with colors
  const statusColors = {
    pending: "#f6c23e",
    confirmed: "#4e73df",
    delivered: "#1cc88a",
    cancelled: "#e74a3b",
  };

  const statusSummary = orders.reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = { count: 0, total: 0 };
    acc[order.status].count += 1;
    acc[order.status].total += order.total_price;
    return acc;
  }, {});

  // LOGIN PAGE
  if (!loggedIn) {
    return (
      <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ color: "#333" }}>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 10, width: "100%", maxWidth: 320, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12 }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 20px", background: "#4e73df", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
      </div>
    );
  }

  // DASHBOARD
  return (
    <div style={{ padding: 16, fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <h1 style={{ color: "#333" }}>Orders Dashboard</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleRefresh} style={{ padding: "8px 16px", background: "#36b9cc", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }} disabled={loading}>
            Refresh
          </button>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#e74a3b", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }} disabled={loading}>
            Logout
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        {["pending", "confirmed", "delivered", "cancelled"].map((status) => (
          <div key={status} style={{
            flex: "1 1 120px",
            padding: 16,
            borderRadius: 10,
            background: statusColors[status],
            color: "#fff",
            textAlign: "center",
            minWidth: 120
          }}>
            <div style={{ fontWeight: "bold", fontSize: 16, textTransform: "capitalize" }}>{status}</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{statusSummary[status]?.count || 0} orders</div>
            <div style={{ fontSize: 14, marginTop: 2 }}>${statusSummary[status]?.total.toFixed(2) || "0.00"}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name, phone, email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 180px", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="">Sort By</option>
          <option value="date_desc">Date (Newest)</option>
          <option value="date_asc">Date (Oldest)</option>
          <option value="total_desc">Total (High → Low)</option>
          <option value="total_asc">Total (Low → High)</option>
          <option value="status_asc">Status (A → Z)</option>
          <option value="status_desc">Status (Z → A)</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "#f8f9fc", color: "#333" }}>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Customer</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Phone</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Email</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Items</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Total</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Date</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: 12 }}>No orders found</td>
                </tr>
              ) : (
                sortedOrders.map((order) => {
                  let itemsList = [];
                  try {
                    itemsList =
                      typeof order.items === "string"
                        ? JSON.parse(order.items || "[]")
                        : order.items || [];
                  } catch (e) {
                    itemsList = [];
                  }

                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{order.id}</td>
                      <td style={{ padding: 8 }}>{order.customer_name}</td>
                      <td style={{ padding: 8 }}>{order.phone_number}</td>
                      <td style={{ padding: 8 }}>{order.email}</td>
                      <td style={{ padding: 8, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                        {itemsList.map((i) => `${i.name} x${i.quantity}`).join("\n")}
                      </td>
                      <td style={{ padding: 8 }}>${order.total_price.toFixed(2)}</td>
                      <td style={{ padding: 8, textTransform: "capitalize", fontWeight: "bold", color: statusColors[order.status] }}>
                        {order.status}
                      </td>
                      <td style={{ padding: 8 }}>
                        {new Date(order.created_at + "Z").toLocaleString("en-US", {
                          timeZone: "Asia/Beirut",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => updateStatus(order.id, "confirmed")} style={{ padding: "6px 8px", marginBottom: 4, background: "#4e73df", color: "#fff", border: "none", borderRadius: 4 }}>Confirm</button>
                        <button onClick={() => updateStatus(order.id, "delivered")} style={{ padding: "6px 8px", marginBottom: 4, marginLeft: 4, background: "#1cc88a", color: "#fff", border: "none", borderRadius: 4 }}>Delivered</button>
                        <button onClick={() => updateStatus(order.id, "cancelled")} style={{ padding: "6px 8px", marginLeft: 4, background: "#e74a3b", color: "#fff", border: "none", borderRadius: 4 }}>Cancel</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
    </div>
  );
}
