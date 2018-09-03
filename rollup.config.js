const { terser } = require("rollup-plugin-terser");

module.exports = {
  input: "src/index.js",
  plugins: [process.env.MINIFY === "true" ? terser() : null].filter(p => p)
};
