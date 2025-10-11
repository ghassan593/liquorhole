// pages/brands/[slug].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Navigation from "../../components/Navigation";
import Link from "next/link";

export default function BrandPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        // 1) find the brand by slug
        const { data: bdata, error: brandErr } = await supabase
          .from("brands")
          .select("*")
          .eq("slug", slug)
          .limit(1)
          .single();

        if (brandErr || !bdata) {
          setError("Brand not found");
          setBrand(null);
          setProducts([]);
          setLoading(false);
          return;
        }

        setBrand(bdata);

        // 2) fetch products that reference this brand_id
        const { data: prods, error: prodErr } = await supabase
          .from("alcohols")
          .select("*")
          .eq("brand_id", bdata.id)
          .order("created_at", { ascending: false });

        if (prodErr) {
          console.error("Error fetching brand products:", prodErr);
          setError("Failed to load products");
          setProducts([]);
        } else {
          setProducts(prods || []);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return (
    <>
      <Navigation />
      <main style={{ maxWidth: 1200, margin: "24px auto", padding: "0 20px" }}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "crimson" }}>{error}</p>
        ) : (
          <>
            <header style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <h1 style={{ margin: 0 }}>{brand?.name}</h1>
              <span style={{ color: "#666" }}>{products.length} product{products.length !== 1 ? "s" : ""}</span>
            </header>

            {products.length === 0 ? (
              <p>No products for this brand yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 20,
                }}
              >
                {products.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: "1px solid #e6e6e6",
                      borderRadius: 8,
                      padding: 10,
                      textAlign: "center",
                      background: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <div>
                      <div style={{ height: 140, marginBottom: 8 }}>
                        <img
                          src={p.image_url || (p.image_urls && p.image_urls[0]) || "/placeholder.png"}
                          alt={p.name}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover", borderRadius: 6 }}
                        />
                      </div>

                      <h3 style={{ margin: "8px 0 6px", fontSize: 16 }}>{p.name}</h3>
                      <p style={{ margin: 0, color: "#333", fontWeight: 600 }}>
                        ${Number(p.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <Link href={`/product/${p.slug || p.id}`}>
                        <a
                          style={{
                            flex: 1,
                            display: "inline-block",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            textAlign: "center",
                            color: "#333",
                            fontWeight: 600,
                            background: "#f9f9f9",
                            textDecoration: "none",
                          }}
                        >
                          View
                        </a>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
