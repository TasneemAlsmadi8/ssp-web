/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#a982c4",
          100: "#9a6dba",
          200: "#8c59b1",
          300: "#7d44a7",
          400: "#6f2f9d",
          500: "#642a8d",
          600: "#59267e",
          700: "#4e216e",
          800: "#431c5e",
          900: "#38184f",
        },
        secondary: {
          50: "#e06bc4",
          100: "#db53ba",
          200: "#d63ab1",
          300: "#d122a7",
          400: "#cc099d",
          500: "#b8088d",
          600: "#a3077e",
          700: "#8f066e",
          800: "#7a055e",
          900: "#66054f",
        },
      },
    },
  },
  // corePlugins: {
  //   preflight: false,
  // },
  plugins: [],
};
