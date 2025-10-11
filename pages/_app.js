// pages/_app.js
import "../styles/globals.css"; // if you have global css
import { CartProvider } from "../context/CartContext";
import Head from "next/head";
import AgeVerification from "../components/AgeVerification";
import { ToastProvider } from "@/context/ToastContext";

function MyApp({ Component, pageProps }) {
  return (
    
    <CartProvider>
      <ToastProvider>

      
{      <AgeVerification />
}      <Component {...pageProps} />
</ToastProvider>
    </CartProvider>
  );
}

export default MyApp;
