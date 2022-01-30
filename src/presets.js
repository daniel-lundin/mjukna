import { createMatrix } from "./matrix.js";
import { tween } from "./spring.js";
const matrix = createMatrix();

function scaleCSS(value) {
  return matrix
    .clear()
    .s(value, value)
    .css();
}

function fade(element, from, to, springConfig, done) {
  element.style.opacity = from[0];
  element.style.transform = scaleCSS(from[1]);

  tween(
    Object.assign(
      {
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
      },
      springConfig
    )
  );
}

export function fadeIn(element, springConfig) {
  const from = [0, 0.8];
  const to = [1, 1];
  return new Promise(done => fade(element, from, to, springConfig, done));
}

export function fadeOut(element, springConfig) {
  const from = [1, 1];
  const to = [0, 0.8];
  return new Promise(done => fade(element, from, to, springConfig, done));
}
