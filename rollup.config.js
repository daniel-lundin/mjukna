const { terser } = require("rollup-plugin-terser");
const resolve = require("rollup-plugin-node-resolve");

module.exports = {
  input: "index.js",
  plugins: [
    process.env.MINIFY === "true" ? terser() : null,
    resolve({
      module: true,
      preferBuiltins: false,
      modulesOnly: true
    })
  ].filter(p => p)
};
