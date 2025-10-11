// pages/category/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useCart } from "../../context/CartContext";

export default function CategoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [alcohols, setAlcohols] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    async function fetchAlcohols() {
      setLoading(true);
      const { data, error } = await supabase
        .from("alcohols")
        .select("*")
        .eq("category_id", id);

      if (error) {
        console.error("Error fetching alcohols:", error);
      } else {
        setAlcohols(data || []);
      }
      setLoading(false);
    }
    fetchAlcohols();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 20, textTransform: "capitalize" }}>
        Category
      </h1>
      {alcohols.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20,
          }}
        >
          {alcohols.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 6,
                    marginBottom: 10,
                  }}
                />
              )}
              <h3 style={{ margin: "4px 0" }}>{p.name}</h3>
              <p style={{ color: "#555", fontSize: 14 }}>{p.type}</p>
              <p style={{ fontWeight: 600 }}>${p.price}</p>
              <button
                onClick={() =>
                  addItem({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price || 0),
                    image_url: p.image_url,
                    type: p.type || "",
                  })
                }
                style={{
                  marginTop: "auto",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
