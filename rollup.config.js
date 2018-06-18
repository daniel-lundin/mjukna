import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";

export default {
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
