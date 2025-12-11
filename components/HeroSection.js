"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import styles from "./HeroSection.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slides = [
    {
      desktop: "/Ads/pic1.jpg",
      mobile: "/Ads/pic1.jpg",
      alt: "Promo 1",
      title: "Check out Ireland's oldest licensed whiskey",
      //subtitle: "Discover premium blends and exclusive offers.",
      link: "/product/bushmills-original",
    },
    {
      desktop: "/Ads/pic2.jpg",
      mobile: "/Ads/pic2.jpg",
      alt: "Promo 2",
      title: "56 reasons to drink jagermeister today",
      //subtitle: "Only for true connoisseurs. Don’t miss out.",
      link: "/product/Jagermeister",
    },
    {
      desktop: "/Ads/pic3.jpg",
      mobile: "/Ads/pic3.jpg",
      alt: "Promo 3",
      title: "Christmas isn't the same without Bailey's",
      //subtitle: "Check our latest craft spirits and offers.",
      link: "/product/baileys-original",
    },
  ];

  return (
    <section className={styles.heroSection}>
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        effect="fade"
        loop
        className={styles.swiper}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            {/* 🔥 Whole slide is clickable */}
            <Link href={slide.link} className={styles.slideLink}>
              <div className={styles.imageContainer}>
                <Image
                  src={isMobile ? slide.mobile : slide.desktop}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  className={styles.image}
                />

                {/* Overlay gradient */}
                <div className={styles.overlay}></div>

                {/* Text content (still visible, but no button) */}
                <div className={styles.textOverlay}>
                  <h2 className={styles.title}>{slide.title}</h2>
                  <p className={styles.subtitle}>{slide.subtitle}</p>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
