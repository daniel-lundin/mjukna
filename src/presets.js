import { createMatrix } from "./matrix.js";
import tween from "spring-array";
const matrix = createMatrix();

function scaleCSS(value) {
  return matrix
    .clear()
    .s(value, value)
    .css();
}

function fade(element, from, to, done) {
  element.style.opacity = from[0];
  element.style.transform = scaleCSS(from[1]);

  tween({
    from,
    to,
    update([opacity, scale]) {
      element.style.opacity = opacity;
      element.style.transform = scaleCSS(scale);
    },
    done() {
      element.style.opacity = to[0];
      element.style.transform = scaleCSS(to[1]);
      done();
    }
  });
}

export function fadeIn(element, done) {
  const from = [0, 0.8];
  const to = [1, 1];
  fade(element, from, to, done);
}

export function fadeOut(element, done) {
  const from = [1, 1];
  const to = [0, 0.8];
  fade(element, from, to, done);
}
