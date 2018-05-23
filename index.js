import tween from "https://unpkg.com/spring-array@1.2.4/src/index.js?module";
let mjuka = [];
let observer;

const observeConfig = {
  childList: true,
  subtree: true,
  attributes: true
};
const TENSION = 0.1;
const DECELERATION = 0.65;

export function mjukna(
  elements,
  {
    scale = false,
    tension = TENSION,
    deceleration = DECELERATION,
    staggerBy = 0
  } = {}
) {
  if (mjuka.length === 0) {
    init();
  }
  [].concat(elements).forEach(element => {
    const item = {
      element,
      config: { scale, tension, deceleration, staggerBy },
      previousPosition: element.getBoundingClientRect(),
      targetPosition: element.getBoundingClientRect(),
      animationOffsets: {
        x: 0,
        y: 0,
        widthDiff: 0,
        heightDiff: 0
      },
      stop: () => {}
    };
    mjuka.push(item);
  });
}

function init(root = document) {
  observer = new MutationObserver(() => {
    if (mjuka.length === 0) return;
    updateElements();
  });

  observer.observe(root, observeConfig);
  return () => observer.disconnect();
}

function FLIPTranslate(mjuk, newPosition, index) {
  const {
    previousPosition,
    element,
    config: { tension, deceleration, staggerBy }
  } = mjuk;
  const xCenterDiff = previousPosition.x - newPosition.x;
  const yCenterDiff = previousPosition.y - newPosition.y;

  element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px)`;

  setTimeout(() => {
    tween({
      from: [xCenterDiff, yCenterDiff],
      to: [0, 0],
      update([x, y]) {
        element.style.transform = `translate(${x}px, ${y}px)`;
      },
      done() {
        element.style.transform = "";
      },
      tension,
      deceleration
    });
  }, index * staggerBy);
}

function FLIPScaleTranslate(mjuk, newPosition, index) {
  const {
    previousPosition,
    element,
    config: { tension, deceleration, staggerBy }
  } = mjuk;
  const xCenterDiff =
    previousPosition.x +
    previousPosition.width / 2 -
    (newPosition.x + newPosition.width / 2);

  const yCenterDiff =
    previousPosition.y +
    previousPosition.height / 2 -
    (newPosition.y + newPosition.height / 2);

  const xScaleCompensation = previousPosition.width / newPosition.width;
  const yScaleCompensation = previousPosition.height / newPosition.height;

  mjuk.element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px) scale(${xScaleCompensation}, ${yScaleCompensation})`;

  setTimeout(() => {
    tween({
      from: [xCenterDiff, yCenterDiff, xScaleCompensation, yScaleCompensation],
      to: [0, 0, 1, 1],
      update([x, y, scaleX, scaleY]) {
        element.style.transform = `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
      },
      done() {
        element.style.transform = "";
      },
      tension,
      deceleration
    });
  }, index * staggerBy);
}

function updateElements() {
  mjuka.forEach((mjuk, index) => {
    if (
      positionsEqual(
        mjuk.element.getBoundingClientRect(),
        mjuk.previousPosition
      )
    ) {
      return;
    }

    mjuk.element.style.transform = "";
    const newPosition = mjuk.element.getBoundingClientRect();
    if (mjuk.config.scale) {
      FLIPScaleTranslate(mjuk, newPosition, index);
    } else {
      FLIPTranslate(mjuk, newPosition, index);
    }
  });
  mjuka = [];
}

function positionsEqual(pos1, pos2) {
  return (
    pos1.top === pos2.top &&
    pos1.left === pos2.left &&
    pos1.right === pos2.right &&
    pos1.bottom === pos2.bottom
  );
}
