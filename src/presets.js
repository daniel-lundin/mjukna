import { createMatrix } from "./matrix.js";
const matrix = createMatrix();

export function fadeIn(element) {
  return {
    from: [0, 0.8],
    to: [1, 1],
    start() {
      element.style.opacity = 0;
      element.style.transform = matrix
        .clear()
        .s(0.8, 0.8)
        .css();
    },
    update([opacity, scale]) {
      element.style.opacity = opacity;
      element.style.transform = matrix
        .clear()
        .s(scale, scale)
        .css();
    },
    done() {
      element.style.opacity = 1;
      element.style.transform = "";
    }
  };
}

function squeeze(
  element,
  { xOffset = 0, yOffset = 0, xSqueeze = false, ySqueeze = false }
) {
  return {
    from: [0],
    to: [1],
    start() {
      element.style.transform = matrix
        .clear()
        .t(-xOffset, -yOffset)
        .s(xSqueeze ? 0 : 1, ySqueeze ? 0 : 1)
        .t(xOffset, yOffset)
        .css();
    },
    update([scale]) {
      const css = matrix
        .clear()
        .t(-xOffset, -yOffset)
        .s(xSqueeze ? scale : 1, ySqueeze ? scale : 1)
        .t(xOffset, yOffset)
        .css();
      element.style.transform = css;
    },
    done() {
      element.style.transform = "";
    }
  };
}
function squeezeInLeft(element) {
  const xOffset = element.getBoundingClientRect().width / 2;
  return squeeze(element, { xOffset, xSqueeze: true });
}

function squeezeInRight(element) {
  const xOffset = -element.getBoundingClientRect().width / 2;
  return squeeze(element, { xOffset, xSqueeze: true });
}

function squeezeInTop(element) {
  const yOffset = -element.getBoundingClientRect().height / 2;
  return squeeze(element, { yOffset, ySqueeze: true });
}

function squeezeInBottom(element) {
  const yOffset = element.getBoundingClientRect().height / 2;
  return squeeze(element, { yOffset, ySqueeze: true });
}

function squeezeIn(element) {
  return squeeze(element, { xSqueeze: true, ySqueeze: true });
}

const entryPresets = {
  squeeze: squeezeIn,
  squeezeLeft: squeezeInLeft,
  squeezeRight: squeezeInRight,
  squeezeBottom: squeezeInBottom,
  squeezeTop: squeezeInTop,
  fade: fadeIn
};

export function getEntryAnimation(name, element) {
  return (entryPresets[name] || fadeIn)(element);
}
