"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./OffersSection.module.css";
import { useCart } from "../context/CartContext"; // import cart context
import { useToast } from "@/context/ToastContext";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OffersSection() {
  const [offersByCategory, setOffersByCategory] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const { addItem } = useCart();
  const {showToast}=useToast();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from("alcohols")
        .select("*")
        .not("discount_price", "is", null)
        .order("created_at", { ascending: false });

      if (error) return console.error("Error fetching offers:", error);

      const grouped = data.reduce((acc, product) => {
        const category = product.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
      }, {});

      setOffersByCategory(grouped);
    };

    fetchOffers();
  }, []);

  return (
    <section className={styles.offersSection}>
      <h2 className={styles.title}>Exclusive Discounts</h2>

      {Object.entries(offersByCategory).map(([category, products]) => (
        <div key={category} className={styles.categoryGroup}>
          <div className={styles.categoryHeader}>
            <h3 className={styles.categoryTitle}>{category}</h3>
            <Link href={`/collections/${category.toLowerCase()}?discount=true`}>
              <button className={styles.viewMoreBtn}>View All</button>
            </Link>
          </div>

          <Swiper
            modules={[Navigation]}
            navigation={{
              nextEl: `.swiper-button-next-top-${category}`,
              prevEl: `.swiper-button-prev-top-${category}`,
            }}
            spaceBetween={20}
            slidesPerView={isMobile ? 1.5 : 4}
            grabCursor={!isMobile}
            className={styles.offersSwiper}
          >
            {products.map((product) => {
              const discountPrice = product.discount_price;
              const finalPrice = discountPrice || product.price;
              const discountPercent = discountPrice
                ? Math.round(((product.price - discountPrice) / product.price) * 100)
                : null;

              return (
                <SwiperSlide key={product.id}>
                  <div className={styles.offerCard}>
                    <Link href={`/product/${product.slug}`}>
                      <div className={styles.imageWrapper}>
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover", borderRadius: "10px" }}
                        />
                      </div>
                    </Link>

                    <button
                      className={styles.addToCartBtn}
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
                    >
                      Add to Cart
                    </button>

                    <div className={styles.offerDetails}>
                      <h4 className={styles.offerName}>{product.name}</h4>
                      <div className={styles.priceContainer}>
                        {discountPrice && (
                          <>
                            <span className={styles.oldPrice}>
                              ${product.price.toFixed(2)}
                            </span>
                            <span className={styles.newPrice}>
                              ${discountPrice.toFixed(2)}
                            </span>
                            <span className={styles.discountBadge}>
                              {discountPercent}% OFF
                            </span>
                          </>
                        )}
                        {!discountPrice && (
                          <span className={styles.newPrice}>
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      ))}
    </section>
);
}
