// context/ToastContext.js
import { createContext, useContext, useState, useEffect } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: "", visible: false, animate: false });

  const showToast = (message) => {
    setToast({ message, visible: true, animate: true });
    
    // Hide after 2 seconds
    setTimeout(() => setToast({ message, visible: true, animate: false }), 1800);
    setTimeout(() => setToast({ message: "", visible: false, animate: false }), 2000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div
          style={{
            position: "fixed",
            bottom: toast.animate ? 40 : 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#d4af37",
            color: "#000",
            padding: "10px 16px",
            borderRadius: 8,
            fontWeight: 700,
            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
            zIndex: 9999,
            textAlign: "center",
            opacity: toast.animate ? 1 : 0,
            transition: "all 0.3s ease-in-out",
          }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
