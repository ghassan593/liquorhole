import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 10000); // Auto close after 10 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: "#333",
    success: "#28a745",
    error: "#dc3545",
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: colors[type],
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 6,
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      zIndex: 9999,
      fontWeight: 500,
      minWidth: 200,
      textAlign: "center",
    }}>
      {message}
    </div>
  );
}
