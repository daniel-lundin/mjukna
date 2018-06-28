import { createMatrix } from "./matrix.js";
const matrix = createMatrix();

function fadeIn(element) {
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
    end() {
      element.style.opacity = 1;
      element.style.transform = matrix
        .clear()
        .s(1, 1)
        .css();
    }
  };
}

function squeeze(
  element,
  {
    offsetX = 0,
    offsetY = 0,
    scaleOriginX = 0,
    scaleOriginY = 0,
    squeezeX = false,
    squeezeY = false
  }
) {
  return {
    from: [0],
    to: [1],
    start() {
      element.style.transform = matrix
        .clear()
        .t(-offsetX, -offsetY)
        .t(-scaleOriginX, -scaleOriginY)
        .s(squeezeX ? 0 : 1, squeezeY ? 0 : 1)
        .t(scaleOriginX, scaleOriginY)
        .css();
    },
    update([scale]) {
      element.style.transform = matrix
        .clear()
        .t(-offsetX, -offsetY)
        .t(-scaleOriginX, -scaleOriginY)
        .s(squeezeX ? scale : 1, squeezeY ? scale : 1)
        .t(scaleOriginX, scaleOriginY)
        .css();
    },
    end() {
      element.style.transform = matrix
        .clear()
        .t(-offsetX, -offsetY)
        .css();
    }
  };
}
function squeezeInLeft(element) {
  const scaleOriginX = element.getBoundingClientRect().width / 2;
  return squeeze(element, { scaleOriginX, squeezeX: true });
}

function squeezeInRight(element) {
  const scaleOriginX = -element.getBoundingClientRect().width / 2;
  return squeeze(element, { scaleOriginX, squeezeX: true });
}

function squeezeInTop(element) {
  const scaleOriginY = element.getBoundingClientRect().height / 2;
  return squeeze(element, { scaleOriginY, squeezeY: true });
}

function squeezeInBottom(element) {
  const scaleOriginY = -element.getBoundingClientRect().height / 2;
  return squeeze(element, { scaleOriginY, squeezeY: true });
}

function squeezeIn(element) {
  return squeeze(element, { squeezeX: true, squeezeY: true });
}

const enterPresets = {
  squeeze: squeezeIn,
  squeezeLeft: squeezeInLeft,
  squeezeRight: squeezeInRight,
  squeezeBottom: squeezeInBottom,
  squeezeTop: squeezeInTop,
  fade: fadeIn
};

function squeezeOut(element, offsetX, offsetY) {
  return squeeze(element, {
    offsetX,
    offsetY,
    squeezeX: true,
    squeezeY: true
  });
}

function squeezeOutLeft(element, offsetX, offsetY) {
  const scaleOriginX = element.getBoundingClientRect().width / 2;
  return squeeze(element, {
    offsetX,
    offsetY,
    scaleOriginX,
    squeezeX: true
  });
}
function squeezeOutRight(element, offsetX, offsetY) {
  const scaleOriginX = -element.getBoundingClientRect().width / 2;
  return squeeze(element, {
    offsetX,
    offsetY,
    scaleOriginX,
    squeezeX: true
  });
}

function squeezeOutTop(element, offsetX, offsetY) {
  const scaleOriginY = element.getBoundingClientRect().height / 2;
  return squeeze(element, {
    offsetX,
    offsetY,
    scaleOriginY,
    squeezeY: true
  });
}

function squeezeOutBottom(element, offsetX, offsetY) {
  const scaleOriginY = -element.getBoundingClientRect().height / 2;
  return squeeze(element, {
    offsetX,
    offsetY,
    scaleOriginY,
    squeezeY: true
  });
}

const exitPresets = {
  squeeze: squeezeOut,
  squeezeLeft: squeezeOutLeft,
  squeezeRight: squeezeOutRight,
  squeezeTop: squeezeOutTop,
  squeezeBottom: squeezeOutBottom
};

export function getEnterAnimation(name, element) {
  return (enterPresets[name] || fadeIn)(element);
}

export function getExitAnimation(name, element, offsetX, offsetY) {
  return (exitPresets[name] || squeeze)(element, offsetX, offsetY);
}
