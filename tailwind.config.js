const { nextui } = require("@nextui-org/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/page.tsx",
    "./src/app/SettingsPhase.tsx",
    "./node_modules/@nextui-org/theme/dist/components/(breadcrumbs|button|checkbox|chip|date-picker|divider|dropdown|input|modal|progress|ripple|select|skeleton|snippet|spinner|user|calendar|date-input|popover|menu|listbox|scroll-shadow|avatar).js",
  ],
  theme: {
    extend: {},
  },

  plugins: [nextui()],
};
