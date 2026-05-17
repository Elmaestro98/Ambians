import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      {
        caramellatte: {
          primary: "#6F4E37",
          secondary: "#C68E17",
          accent: "#F5F5DC",
          neutral: "#3D4451",
          "base-100": "#FFFDD0",
        },
      },
    ],
  },
};

export default config;
