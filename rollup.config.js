import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "index.js",
  plugins: [
    process.env.MINIFY === "true" ? terser() : null,
    babel({
      exclude: "node_modules/**",
      babelrc: false,
      plugins: [
        ["module-rewrite", { replaceFunc: "./utils/replace-module-paths.js" }]
      ]
    }),
    resolve({
      module: true,
      preferBuiltins: false,
      modulesOnly: true
    })
  ].filter(p => p)
};
