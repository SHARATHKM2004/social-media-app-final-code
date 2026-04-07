/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode:"class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0050ff", // Wipfli Blue [1](https://sengideons.com/npx-tailwind-css-init-not-working-in-cmd/)
          gray: "#63666a", // Wipfli Gray [1](https://sengideons.com/npx-tailwind-css-init-not-working-in-cmd/)
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};