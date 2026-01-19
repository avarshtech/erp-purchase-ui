import React from "react";
import ReactDOM from "react-dom/client";
import 'react-quill/dist/quill.snow.css';
import "jsvectormap/dist/css/jsvectormap.css";
import 'react-toastify/dist/ReactToastify.css';
import 'react-modal-video/css/modal-video.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from "./App";
import reportWebVitals from "./reportWebVitals";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <App />
  </>
);

reportWebVitals();

// Prevent theme-toggle transition lag by temporarily disabling CSS transitions
// on the document while the `data-theme` attribute changes.
;(function disableTransitionsOnThemeToggle() {
  try {
    const styleId = "disable-theme-transitions-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .disable-theme-transitions *,
        .disable-theme-transitions *::before,
        .disable-theme-transitions *::after {
          transition: none !important;
          animation: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    let clearTimer = null;
    const applyTemporaryDisable = () => {
      if (clearTimer) {
        clearTimeout(clearTimer);
        clearTimer = null;
      }
      document.documentElement.classList.add("disable-theme-transitions");
      // Re-enable after a short delay to allow immediate repaint
      clearTimer = setTimeout(() => {
        document.documentElement.classList.remove("disable-theme-transitions");
        clearTimer = null;
      }, 60);
    };

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          applyTemporaryDisable();
          break;
        }
      }
    });

    obs.observe(document.documentElement, { attributes: true });
  } catch (e) {
    // fail silently
    console.warn("theme toggle helper failed:", e);
  }
})();
