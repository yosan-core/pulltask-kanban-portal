/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff4ec",
          100: "#ffe4cc",
          400: "#ff8c33",
          500: "#f47820",
          600: "#d9640f",
          700: "#b5500b",
        },
        gh: {
          bg:      "#0d1117",
          surface: "#161b22",
          card:    "#1c2128",
          border:  "#30363d",
          text:    "#e6edf3",
          muted:   "#7d8590",
          blue:    "#388bfd",
          blueDim: "#1f6feb33",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
