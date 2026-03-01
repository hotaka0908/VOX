/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        vox: {
          bg: "#0B0F17",
          surface: "#121A2A",
          border: "rgba(255,255,255,0.08)",
          primary: "#4F8CFF",
          accent: "#7AE7C7",
          danger: "#FF5A6A",
        },
      },
    },
  },
  plugins: [],
};
