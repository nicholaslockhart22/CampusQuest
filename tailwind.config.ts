import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        quest: {
          dark: "#1a1b26",
          panel: "#24283b",
          accent: "#7aa2f7",
          gold: "#e0af68",
          green: "#9ece6a",
          red: "#f7768e",
          purple: "#bb9af7",
        },
        uri: {
          navy: "#041E42",
          keaney: "#68ABE8",
          white: "#FFFFFF",
          "navy-light": "#0d3266",
          panel: "#0d3266",
          card: "#f8fafc",
          accent: "#68ABE8",
          gold: "#c5a028",
          teal: "#00838f",
          green: "#2e7d32",
          purple: "#5e35b1",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
