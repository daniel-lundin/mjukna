import { createMatrix } from "./matrix.js";
import tween from "spring-array";
const matrix = createMatrix();

function scaleCSS(value) {
  return matrix
    .clear()
    .s(value, value)
    .css();
}

export function fadeIn(element, done) {
  element.style.opacity = 0;
  element.style.transform = scaleCSS(0.8);

  tween({
    from: [0, 0.8],
    to: [1, 1],
    update([opacity, scale]) {
      element.style.opacity = opacity;
      element.style.transform = scaleCSS(scale);
    },
    done() {
      element.style.opacity = 1;
      element.style.transform = scaleCSS(1);
      done();
    }
  });
}
