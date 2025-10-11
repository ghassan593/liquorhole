// context/CartContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
const LOCAL_STORAGE_KEY = "liquorhole_cart_v1";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to read cart from localStorage", e);
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Failed to write cart to localStorage", e);
    }
  }, [cart]);

  // Handle CustomEvent "add-to-cart" globally
  useEffect(() => {
    const handleAddToCart = (e) => {
      addItem(e.detail);
    };
    window.addEventListener("add-to-cart", handleAddToCart);
    return () => window.removeEventListener("add-to-cart", handleAddToCart);
  }, [cart]);

  // Add a product to cart
  const addItem = (product) => {
    if (!product || !product.id) return;
    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // Remove a product from cart
  const removeItem = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  // Update quantity (removes if qty <= 0)
  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeItem(id);
    setCart((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: Number(qty) } : p))
    );
  };

  // Clear entire cart
  const clearCart = () => setCart([]);

  // Calculate total price
  const getTotal = () =>
    cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  // Total items in cart
  const itemCount = () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, getTotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}