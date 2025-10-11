// pages/collections/[slug].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Navigation from "../../components/Navigation";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import styles from "../../styles/CollectionPage.module.css"
import { useToast } from "@/context/ToastContext";

export default function CollectionPage() {
  const router = useRouter();
  const { slug } = router.query;
  const isDiscountOnly = router.query.discount === "true"; // ✅ check for discount
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [collectionName, setCollectionName] = useState("");
  const { addItem } = useCart();
  const {showToast}=useToast();

  useEffect(() => {
    if (!slug) return;
    fetchMenuAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isDiscountOnly]);

  async function fetchMenuAndProducts() {
    setLoading(true);
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .order("id", { ascending: true });

      if (itemsError) {
        console.error("Error loading menu items:", itemsError);
        setMenuItems([]);
        setProducts([]);
        setLoading(false);
        return;
      }

      const items = itemsData || [];
      setMenuItems(items);

      const map = {};
      items.forEach((it) => (map[it.id] = { ...it, children: [] }));
      items.forEach((it) => {
        if (it.parent_id !== null && map[it.parent_id]) {
          map[it.parent_id].children.push(map[it.id]);
        }
      });

      const normalizedTarget = `/collections/${slug}`.replace(/\/+$/, "").toLowerCase();
      const findNodeByUrl = (list) => {
        for (const n of list) {
          if (n.url) {
            const u = String(n.url).replace(/\/+$/, "").toLowerCase();
            if (u === normalizedTarget || u.endsWith(normalizedTarget)) {
              return n;
            }
          }
        }
        return null;
      };

      let targetNode = findNodeByUrl(Object.values(map));
      if (!targetNode) {
        targetNode = Object.values(map).find(
          (m) => String(m.name || "").toLowerCase() === String(slug).toLowerCase()
        );
      }

      if (!targetNode) {
        setCollectionName(slug);
        let query = supabase.from("alcohols").select("*").ilike("type", `%${slug}%`);
        if (isDiscountOnly) query = query.not("discount_price", "is", null); // ✅ filter here
        const { data: fallbackProducts } = await query.limit(200);
        setProducts(fallbackProducts || []);
        setLoading(false);
        return;
      }

      setCollectionName(targetNode.name || slug);

      const ids = [];
      const collect = (node) => {
        ids.push(node.id);
        node.children?.forEach(collect);
      };
      collect(targetNode);

      // ✅ Main product query
      let query = supabase
        .from("alcohols")
        .select("*")
        .in("menu_item_id", ids)
        .order("created_at", { ascending: false })
        .limit(500);

      if (isDiscountOnly) query = query.not("discount_price", "is", null); // ✅ discount filter

      const { data: prods, error: prodsError } = await query;
      if (prodsError) {
        console.error("Error fetching products:", prodsError);
        setProducts([]);
      } else {
        setProducts(prods || []);
      }
    } catch (err) {
      console.error("Unexpected error in collection fetch:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  
return (
  <>
    <Navigation />
    <section className={styles.container}>
      <h2 className={styles.title}>
        {collectionName
          ? `${collectionName.toUpperCase()} ${
              isDiscountOnly ? "— OFFERS" : ""
            }`
          : "Collection"}
      </h2>

      {loading ? (
        <div style={{ color: "#666" }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ color: "#777", padding: 20 }}>
          No products found in this collection.
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((p) => {
            const priceNum = Number(p.price || 0);
            const discount = p.discount_price
              ? Math.round(
                  ((p.price - p.discount_price) / p.price) * 100
                )
              : null;

            return (
              <div key={p.id} className={styles.card}>
                <Link href={`/product/${p.slug}`}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={p.image_url || "/placeholder.png"}
                      alt={p.name}
                    />
                  </div>
                </Link>

                <button
                  className={styles.addToCart}
                  onClick={() =>{
                    addItem({
                      id: p.id,
                      name: p.name,
                      price: p.discount_price || priceNum,
                      image_url: p.image_url || "",
                    });
                     showToast ("Added to cart!");
                    }
                  }
                >
                  Add to Cart
                </button>

                <div className={styles.details}>
                  <h3>{p.name}</h3>

                  <div className={styles.priceWrapper}>
                    {p.discount_price ? (
                      <>
                        <span className={styles.oldPrice}>
                          ${p.price.toFixed(2)}
                        </span>
                        <span className={styles.newPrice}>
                          ${p.discount_price.toFixed(2)}
                        </span>
                        <span className={styles.discountTag}>
                          {discount}% OFF
                        </span>
                      </>
                    ) : (
                      <span className={styles.newPrice}>
                        ${priceNum.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  </>
);

}
