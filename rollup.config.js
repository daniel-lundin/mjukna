import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "index.js",
  output: [
    {
      file: "dist/browser.js",
      format: "iife",
      name: "mjukna"
    },
    {
      file: "dist/main.js",
      format: "cjs",
      name: "mjukna"
    }
  ],
  plugins: [
    terser(),
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
      modulesOnly: true // Default: false
    })
  ]
};
