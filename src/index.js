import { tween } from "./spring.js";
import { createMatrix } from "./matrix.js";
import { fadeIn, fadeOut } from "./presets.js";

const m = createMatrix();

const observeConfig = {
  childList: true,
  subtree: true,
  attributes: true,
};

const smartTimeout = (fn, timeout) =>
  timeout === 0 ? fn() : setTimeout(fn, timeout);

let mjuka = [];
let config = {};
let observer;

let runningAnimations = [];
let completionResolver = () => {};

function enableObserver() {
  if (!observer) {
    init();
  }
  observer.observe(document, observeConfig);
}

const FALSE = () => false;

export default function mjukna(elements, options = {}) {
  enableObserver();
  return new Promise((resolve) => {
    completionResolver = resolve;
    config = {
      spring: options.spring,
      staggerBy: options.staggerBy || 0,
      enterFilter: options.enterFilter || FALSE,
      enterAnimation: options.enterAnimation,
    };
    const iterable = Number.isInteger(elements.length)
      ? elements
      : [].concat(elements);
    for (let item of iterable) {
      // Stop any running animations for element
      const getElement = item.anchor ? item.element : () => item;
      runningAnimations = runningAnimations.filter(
        ({ element, staggerTimer, stopper }) => {
          if (element === getElement()) {
            clearInterval(staggerTimer);
            stopper();
          }
          return element !== getElement();
        }
      );

      const mjuk = {
        getElement,
        previousPosition: item.anchor
          ? item.anchor.getBoundingClientRect()
          : getElement().getBoundingClientRect(),
        previousBorderRadius: getComputedStyle(
          item.anchor ? item.anchor : getElement()
        ).borderRadius,
        stop: () => {},
      };
      mjuka.push(mjuk);
    }
  });
}

function enterAnimation(element, getStaggerBy) {
  element.style.willChange = "transform, opacity, border-radius";

  return new Promise((resolve) => {
    smartTimeout(() => {
      if (config.enterAnimation) return config.enterAnimation(element, resolve);
      fadeIn(element, config.spring, resolve);
    }, getStaggerBy());
  });
}

function exitAnimation(mjuk, previousParent, getStaggerBy) {
  const { previousPosition } = mjuk;
  const element = mjuk.getElement();
  previousParent.appendChild(element);
  element.style.position = "absolute";
  element.style.width = `${previousPosition.width}px`;
  element.style.height = `${previousPosition.height}px`;
  element.style.top = 0;
  element.style.left = 0;

  const finalPosition = element.getBoundingClientRect();
  const xDiff = finalPosition.left - previousPosition.left;
  const yDiff = finalPosition.top - previousPosition.top;
  element.style.willChange = "transform, opacity";
  element.style.top = `${-yDiff}px`;
  element.style.left = `${-xDiff}px`;

  return new Promise((resolve) => {
    smartTimeout(() => {
      const done = () => {
        element.remove();
        resolve();
      };
      if (config.exitAnimation) return config.exitAnimation(element, done);
      fadeOut(element, config.spring, done);
    }, getStaggerBy());
  });
}

function init() {
  observer = new MutationObserver((mutations) => {
    observer.disconnect();

    let stagger = 0;
    const getStaggerBy = () => {
      const current = stagger;
      stagger += config.staggerBy;
      return current;
    };

    const childListMutations = mutations.filter(
      ({ type }) => type === "childList"
    );

    const addedNodes = childListMutations
      .map((mutation) => Array.from(mutation.addedNodes))
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter(({ nodeType }) => nodeType === 1);

    const removed = [];
    for (const mutation of childListMutations) {
      for (const removedNode of mutation.removedNodes) {
        const mjuk = mjuka.find((mjuk) => mjuk.getElement() === removedNode);
        const alsoAdded = addedNodes.includes(removedNode);
        if (mjuk && !alsoAdded) {
          removed.push([mjuk, mutation.target]);
        }
      }
    }

    const added = addedNodes
      .filter((e) => config.enterFilter(e))
      .filter((node) => !mjuka.find((m) => node === m.getElement()));
    const present = mjuka.filter((mjuk) => mjuk.getElement().parentNode);

    Promise.all(
      []
        .concat(
          removed.map(([element, previousParent]) =>
            exitAnimation(element, previousParent, getStaggerBy)
          )
        )
        .concat(updateElements(present, getStaggerBy))
        .concat(added.map((element) => enterAnimation(element, getStaggerBy)))
    ).then(completionResolver);
  });
}

function updateElements(activeMjuka, getStaggerBy) {
  const elements = activeMjuka.map((mjuk) => {
    const element = mjuk.getElement();
    element.style.transform = "";
    const finalPosition = element.getBoundingClientRect();
    const finalBorderRadius = getComputedStyle(element).borderRadius;
    return {
      ...mjuk,
      element,
      finalPosition,
      finalBorderRadius,
      scale: {
        x: mjuk.previousPosition.width / finalPosition.width,
        y: mjuk.previousPosition.height / finalPosition.height,
      },
    };
  });

  const animations = elements.map((mjuk) =>
    FLIPScaleTranslate(mjuk, getStaggerBy)
  );

  mjuka = [];
  return Promise.all(animations);
}

function FLIPScaleTranslate(mjuk, getStaggerBy) {
  const { element, scale, previousPosition, finalPosition } = mjuk;
  const centerDiffX =
    previousPosition.left +
    previousPosition.width / 2 -
    (finalPosition.left + finalPosition.width / 2);

  const centerDiffY =
    previousPosition.top +
    previousPosition.height / 2 -
    (finalPosition.top + finalPosition.height / 2);

  element.style.willChange = "transform";
  element.style.transform = m
    .clear()
    .t(centerDiffX, centerDiffY)
    .s(scale.x, scale.y)
    .css();

  const [, previousBorderRadius] = /(\d*)(\w*)/.exec(mjuk.previousBorderRadius);
  const [, currentBorderRadius, borderRadiusUnit] = /(\d*)(\w*)/.exec(
    mjuk.finalBorderRadius
  );
  element.style.borderRadius = `${
    previousBorderRadius / scale.x
  }${borderRadiusUnit} / ${previousBorderRadius / scale.y}${borderRadiusUnit}`;
  const animation = { element, staggerTimer: void 0, stopper: () => {} };
  runningAnimations.push(animation);

  return new Promise((resolve) => {
    animation.staggerTimer = smartTimeout(() => {
      animation.stopper = tween(
        Object.assign(
          {
            from: [
              centerDiffX,
              centerDiffY,
              scale.x,
              scale.y,
              Number(previousBorderRadius),
            ],
            to: [0, 0, 1, 1, Number(currentBorderRadius)],
            update([x, y, scaleX, scaleY, borderRadius]) {
              element.style.transform = m
                .clear()
                .t(x, y)
                .s(scaleX, scaleY)
                .css();
              if (borderRadius !== 0) {
                element.style.borderRadius = `${
                  borderRadius / scaleX
                }${borderRadiusUnit} / ${
                  borderRadius / scaleY
                }${borderRadiusUnit}`;
              }
            },
            done() {
              element.style.transform = "";
              element.style.borderRadius = mjuk.finalBorderRadius;
              resolve();
            },
          },
          config.spring
        )
      );
    }, getStaggerBy());
  });
}
