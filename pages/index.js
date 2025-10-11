// pages/index.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navigation from "../components/Navigation";
import HeroSection from "../components/HeroSection";
import OffersSection from "@/components/OffersSection";
import { useCart } from "../context/CartContext";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Link from "next/link"; // ⬅ Added for product detail links

export default function Home() {
  const [alcohols, setAlcohols] = useState([]);
  const { addItem } = useCart();

  // Load products once
  useEffect(() => {
    fetchAlcohols();
  }, []);

  const fetchAlcohols = async () => {
    const { data, error } = await supabase.from("alcohols").select("*");
    if (error) {
      console.error("Error fetching alcohols:", error);
    } else {
      setAlcohols(data || []);
    }
  };

  return (
    <>
      <Navigation />
      <HeroSection />
      <OffersSection/>
      <Testimonials/>
      <Footer/>
</>
);
}
