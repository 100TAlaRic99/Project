import React, { useEffect } from "react";
import "./Toast.css";

/**
 * Toast
 * ─────
 * Temporary notification that auto-dismisses after 3 seconds.
 *
 * Props:
 *   message  {string}                        – text to display
 *   type     {"success"|"error"|"info"}      – controls colour
 *   onClose  {Function}                      – called when dismissed
 */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = { success: "✅", error: "❌", info: "ℹ️" };

  return (
    <div className={`toast toast--${type}`} role="alert">
      <span className="toast__icon">{icons[type]}</span>
      <span className="toast__msg">{message}</span>
      <button className="toast__close" onClick={onClose}>×</button>
    </div>
  );
}

export default Toast;
