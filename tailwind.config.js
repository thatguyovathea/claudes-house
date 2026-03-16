/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0C0F14",
        surface: "#151920",
        surface2: "#1D2330",
        accent: "#4ECDC4",
        gold: "#F4C842",
        success: "#5CC89C",
        danger: "#FF6B6B",
        purple: "#8B7FE8",
        muted: "#8A909E",
        text: "#E8EAF0",
      },
      fontFamily: {
        serif: ["DMSerifDisplay_400Regular"],
        sans: ["DMSans_400Regular"],
        "sans-medium": ["DMSans_500Medium"],
        "sans-semibold": ["DMSans_600SemiBold"],
      },
    },
  },
  plugins: [],
};
