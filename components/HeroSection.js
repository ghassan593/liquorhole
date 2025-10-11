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
      desktop: "/Ads/desktopAd1.jpg",
      mobile: "/Ads/mobileAd1.jpg",
      alt: "Promo 1",
      title: "Whisky Lovers Special",
      subtitle: "Discover premium blends and exclusive offers.",
      cta: "Shop Now",
      link: "/product/jack-daniels-old-no7",
    },
    {
      desktop: "/Ads/desktopAd2.jpg",
      mobile: "/Ads/mobileAd2.jpg",
      alt: "Promo 2",
      title: "Limited Edition Wines",
      subtitle: "Only for true connoisseurs. Don’t miss out.",
      cta: "Explore",
      link: "/product/jack-daniels-old-no7",
    },
    {
      desktop: "/Ads/desktopAd3.jpg",
      mobile: "/Ads/mobileAd3.jpg",
      alt: "Promo 3",
      title: "New Arrivals Every Week",
      subtitle: "Check our latest craft spirits and offers.",
      cta: "Browse Now",
      link: "/product/jack-daniels-old-no7",
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
            <div className={styles.imageContainer}>
              <Image
                src={isMobile ? slide.mobile : slide.desktop}
                alt={slide.alt}
                fill
                priority={index === 0}
                className={styles.image}
              />

              {/* Overlay gradient for better text visibility */}
              <div className={styles.overlay}></div>

              {/* Text content */}
              <div className={styles.textOverlay}>
                <h2 className={styles.title}>{slide.title}</h2>
                <p className={styles.subtitle}>{slide.subtitle}</p>
                <Link href={slide.link}>
                  <button className={styles.ctaButton}>{slide.cta}</button>
                </Link>
              </div>
              
            </div>
            
          </SwiperSlide>
        ))}
        
      </Swiper>
      
    </section>
  );

}
