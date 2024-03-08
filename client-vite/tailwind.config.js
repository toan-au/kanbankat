/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        catBeige: "#D4CFC9",
        catLightBlue: "#647C8A",
        catDarkBlue: "#3F5565",
        catBlack: "#2A261E",
        catCream: "#F5E6C8",
      },
    },
  },
  plugins: [],
};
