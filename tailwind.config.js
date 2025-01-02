/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "retro-black": "#0a0a0a",
        "retro-purple": "#b967ff",
        "retro-cyan": "#17e9e1",
        "retro-pink": "#ff71ce",
      },
      fontFamily: {
        retro: ["Press Start 2P", "cursive"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
