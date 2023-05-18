/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    screens: {
      sm: '600px',
      md: '960px',
      lg: '1024px'
    },
    extend: {
      colors: {
        'beige': 'rgb(250 244 244)',
        "gwwc-yellow":     "#e86f2b",
        "gwwc-light-yellow":"#e8c52b",
        "gwwc-orange":     "#cc4115",
        "gwwc-light-orange": "#F5D9D0",
        "gwwc-red":        "#ba2934",
        "gwwc-pink":       "#da3552",
        "gwwc-purple":     "#ba175b",
        "gwwc-dark-purple":"#a70f4e",
        "gwwc-darkest-purple":"#770434",
        "gwwc-black":      "#222222",
        "gwwc-dark-grey":  "#817777",
        "gwwc-grey":       "#B1A9A9",
        "gwwc-light-grey": "#ebe4e4",
        "gwwc-off-white":   "#f4f4f4"
      }
    },
  },
  plugins: [],
}

