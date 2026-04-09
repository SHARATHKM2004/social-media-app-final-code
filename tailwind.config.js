/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0050ff",
          gray: "#63666a",
        },

        // ✅ Instagram-like UI tokens (use these everywhere)
        ui: {
          bg: "#FAFAFA",          // app background
          surface: "#FFFFFF",     // cards
          border: "#E5E7EB",      // borders
          ink: "#111827",         // primary text
          muted: "#6B7280",       // secondary text
          faint: "#9CA3AF",       // meta text
          danger: "#DC2626",
          success: "#16A34A",
        },
      },

      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },

      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)", // keep yours
        card: "0 1px 2px rgba(0,0,0,0.06)",   // subtle like insta
        lift: "0 6px 18px rgba(0,0,0,0.10)",  // for modals
      },

      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      transitionDuration: {
        250: "250ms",
      },

      maxWidth: {
        phone: "420px", // insta-like center column
      },
    },
  },
  plugins: [],
};
