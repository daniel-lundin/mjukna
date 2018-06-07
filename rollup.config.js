import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "index.js",
  output: {
    file: "dist/main.js",
    format: "umd",
    name: "mjukna"
  },
  plugins: [
    terser(),
    babel({
      exclude: "node_modules/**"
    }),
    resolve({
      module: true,
      preferBuiltins: false,
      modulesOnly: true // Default: false
    })
  ]
};
