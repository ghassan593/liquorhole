// pages/product/[slug].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Navigation from "../../components/Navigation";
import { useCart } from "../../context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function ProductPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [product, setProduct] = useState(null);
  const { addItem } = useCart();
  const {showToast}=useToast();

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("alcohols")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
    } else {
      setProduct(data);
    }
  };

  if (!product) return <p style={{ textAlign: "center", marginTop: 40 }}>Loading product...</p>;

  const discountPrice = product.discount_price;
  const finalPrice = discountPrice || product.price;
  const discountPercent = discountPrice
    ? Math.round(((product.price - discountPrice) / product.price) * 100)
    : null;

  return (
    <>
      <Navigation />
      <section style={{ maxWidth: 800, margin: "30px 10px ", padding: "0px 20px" }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <img
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              style={{ width: "100%", height: 500, objectFit: "cover", borderRadius: 10,marginTop:5 }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 400, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ marginBottom: 12,marginTop:30,fontSize:"1.86rem",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{product.name}</h1>

              {discountPrice ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ textDecoration: "line-through", color: "#999", fontSize: "1rem" }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "#111" }}>
                    ${discountPrice.toFixed(2)}
                  </span>
                  <span style={{
                    background: "#E0BC64",
                    color: "#fff",
                    padding: "3px 6px",
                    borderRadius: 5,
                    fontWeight: 600,
                    fontSize: "0.9rem"
                  }}>
                    {discountPercent}% OFF
                  </span>
                </div>
              ) : (
                <p style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 20 }}>
                  ${product.price.toFixed(2)}
                </p>
              )}
                <button
              onClick={() =>{
                addItem({
                  id: product.id,
                  name: product.name,
                  price: finalPrice,
                  image_url: product.image_url || "",
                });
                showToast("Added to cart!");
              }
              }
              style={{
                padding: "12px 60px",
                backgroundColor: "#E0BC64",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                color: "white",
                borderRadius: 6,
                transition: "background 0.3s ease",
                marginTop:5,
                marginBottom:40
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#b8952b")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#E0BC64")}
            >
              Add to Cart
            </button>

              <p style={{ marginBottom: 0 ,whiteSpace:"pre-line",fontSize:"1.1rem",fontWeight:200,color:"gray"}}>{product.description} </p>
            </div>

          
          </div>
        </div>
      </section>
    </>
  );
}
