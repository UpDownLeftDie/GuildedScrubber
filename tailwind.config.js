const { nextui } = require("@nextui-org/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/page.tsx",
    "./src/app/SettingsPhase.tsx",
    "./src/components/MultiListSelector.tsx",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },

  darkMode: "class",
  plugins: [nextui()],
};
