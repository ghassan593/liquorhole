// components/AgeCheck.js
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function AgeCheck() {
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showDenied, setShowDenied] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Ensure we only run client-side
  useEffect(() => setMounted(true), []);

  // Decide if we should show (7 days window)
  useEffect(() => {
    if (!mounted) return;
    try {
      const last = Number(localStorage.getItem("ageConfirmed") || 0);
      const now = Date.now();
      const sevenDaysMs = 1 * 24 * 60 * 60 * 1000;
      if (!last || now - last > sevenDaysMs) {
        setShowPopup(true);
      }
    } catch (err) {
      // if localStorage fails, show popup
      setShowPopup(true);
    }
  }, [mounted]);

  // Lock scroll when popup/denied is visible; restore when hidden.
  useEffect(() => {
    if (!mounted) return;
    if (showPopup || showDenied) {
      const y = window.scrollY || window.pageYOffset || 0;
      setScrollY(y);
      // Fix the body so mobile chrome doesn't bounce
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // restore
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      // restore scroll
      window.scrollTo(0, scrollY || 0);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [showPopup, showDenied, mounted, scrollY]);

  const handleConfirm = () => {
    localStorage.setItem("ageConfirmed", String(Date.now()));
    setShowPopup(false);
  };

  const handleDecline = () => {
    setShowPopup(false);
    setShowDenied(true);
    // redirect after short delay
    setTimeout(() => {
      // change to the safe site you prefer
      window.location.href = "https://www.google.com";
    }, 2800);
  };

  if (!mounted) return null;

  // Common overlay style (very high z-index to outrank nav)
  const overlayStyle = {
    position: "fixed",
    inset: 0, // top:0; right:0; bottom:0; left:0
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.78)",
    zIndex: 2147483647, // extremely high to beat any nav
    pointerEvents: "auto",
  };

  const cardStyle = {
    background: "#fff",
    padding: "28px",
    borderRadius: 10,
    maxWidth: 420,
    width: "92%",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  };

  const btnPrimary = {
    padding: "10px 18px",
    background: "#d4af37",
    color: "#000",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  };

  const btnSecondary = {
    padding: "10px 18px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  };

  // Render using portal so overlay is appended to body (avoids stacking context issues)
  return createPortal(
    <>
      {showPopup && (
        <div style={overlayStyle} role="dialog" aria-modal="true">
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: 0 }}>Are you over 18 years old?</h2>
            <p style={{ marginTop: 8, color: "#333" }}>
              You must be at least 18 to enter this site.
            </p>
            <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center" }}>
              <button style={btnPrimary} onClick={handleConfirm}>
                Yes, I am 18+
              </button>
              <button style={btnSecondary} onClick={handleDecline}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showDenied && (
        <div style={overlayStyle} role="alert">
          <div style={cardStyle}>
            <h2 style={{ margin: 0 }}>Sorry!</h2>
            <p style={{ marginTop: 8 }}>You cannot enter this site. You will be redirected shortly.</p>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
