import tween from "spring-array";
import { createMatrix } from "./matrix.js";
import { getEnterAnimation, getExitAnimation } from "./presets.js";
import { buildTree, flatten, withRelativeValues } from "./whiteboard.js";

const m = createMatrix();

const observeConfig = {
  childList: true,
  subtree: true,
  attributes: true
};

const maybeTimeout = (fn, timeout) =>
  timeout === 0 ? fn() : setTimeout(fn, timeout);

let mjuka = [];
let config = {};
let observer;

let inProgress = [];
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
  return new Promise(resolve => {
    completionResolver = resolve;
    config = {
      spring: options.spring,
      staggerBy: options.staggerBy || 0,
      enterFilter: options.enterFilter || FALSE,
      enterAnimation: options.enterAnimation,
      exitAnimation: options.exitAnimation
    };

    [].concat(elements).forEach(item => {
      // Stop any running animations for element
      const getElement = item.anchor ? item.element : () => item;
      inProgress = inProgress.filter(([e, staggerTimer, stopper]) => {
        if (e === getElement()) {
          clearInterval(staggerTimer);
          stopper();
        }
        return e !== getElement();
      });

      const mjuk = {
        getElement,
        previousPosition: item.anchor
          ? item.anchor.getBoundingClientRect()
          : getElement().getBoundingClientRect(),
        stop: () => {}
      };
      mjuka.push(mjuk);
    });
  });
}

function enterAnimation(element, getStaggerBy) {
  element.style.willChange = "transform, opacity";
  const animation = getEnterAnimation(config.enterAnimation, element);
  animation.start();

  return new Promise(resolve =>
    maybeTimeout(() => {
      tween(
        Object.assign(
          {
            from: animation.from,
            to: animation.to,
            update: animation.update,
            done: () => {
              animation.end();
              resolve();
            }
          },
          config.spring
        )
      );
    }, getStaggerBy())
  );
}

function exitAnimation(mjuk, getStaggerBy) {
  const { previousPosition } = mjuk;
  const element = mjuk.getElement();
  document.body.appendChild(element);
  element.style.position = "absolute";
  element.style.width = `${previousPosition.width}px`;
  element.style.height = `${previousPosition.height}px`;

  const newPosition = element.getBoundingClientRect();
  const xDiff = newPosition.left - previousPosition.left;
  const yDiff = newPosition.top - previousPosition.top;
  element.style.willChange = "transform, opacity";

  const animation = getExitAnimation(
    config.exitAnimation,
    element,
    xDiff,
    yDiff
  );

  animation.end();

  return new Promise(resolve =>
    maybeTimeout(() => {
      tween(
        Object.assign(
          {
            from: animation.to,
            to: animation.from,
            update: animation.update,
            done() {
              animation.start();
              document.body.removeChild(element);
              resolve();
            }
          },
          config.spring
        )
      );
    }, getStaggerBy())
  );
}

function init() {
  observer = new MutationObserver(mutations => {
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
      .map(mutation => Array.from(mutation.addedNodes))
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter(({ nodeType }) => nodeType === 1)
      .filter(e => config.enterFilter(e));

    const added = addedNodes.filter(
      node => !mjuka.find(m => node === m.getElement())
    );

    const removed = mjuka.filter(mjuk => !mjuk.getElement().parentNode);
    const present = mjuka.filter(mjuk => mjuk.getElement().parentNode);

    Promise.all(
      []
        .concat(removed.map(mjuk => exitAnimation(mjuk, getStaggerBy)))
        .concat(updateElements(present, getStaggerBy))
        .concat(added.map(element => enterAnimation(element, getStaggerBy)))
    ).then(completionResolver);
  });
}

function updateElements(activeMjuka, getStaggerBy) {
  const tree = activeMjuka
    .map(mjuk => Object.assign(mjuk, { mjuk, element: mjuk.getElement() }))
    .reduce((acc, mjuk) => buildTree(acc, mjuk), []);
  const flatTree = flatten(withRelativeValues(tree));

  const animations = flatTree.map(mjuk =>
    FLIPScaleTranslate(mjuk, getStaggerBy)
  );

  mjuka = [];
  return Promise.all(animations);
}

function FLIPScaleTranslate(mjuk, getStaggerBy) {
  const { parentScale, element, scale, previousPosition, newPosition } = mjuk;
  const xCenterDiff =
    previousPosition.left +
    previousPosition.width / 2 -
    (newPosition.left + newPosition.width / 2);

  const yCenterDiff =
    previousPosition.top +
    previousPosition.height / 2 -
    (newPosition.top + newPosition.height / 2);

  const xScaleCompensation = scale.x;
  const yScaleCompensation = scale.y;

  const xForCenter = newPosition.left + newPosition.width / 2;
  const yForCenter = newPosition.top + newPosition.height / 2;

  element.style.willChange = "transform";
  element.style.transform = m
    .clear()
    .t(-xForCenter, -yForCenter)
    .s(1 / parentScale.x, 1 / parentScale.y)
    .t(xForCenter, yForCenter)
    .t(xCenterDiff, yCenterDiff)
    .s(xScaleCompensation, yScaleCompensation)
    .css();

  const progress = [element, void 0, () => {}];
  inProgress.push(progress);

  return new Promise(resolve => {
    progress[1] = maybeTimeout(() => {
      progress[2] = tween(
        Object.assign(
          {
            from: [
              xCenterDiff,
              yCenterDiff,
              xScaleCompensation,
              yScaleCompensation,
              parentScale.x,
              parentScale.y
            ],
            to: [0, 0, 1, 1, 1, 1],
            update([x, y, scaleX, scaleY, parentScaleX, parentScaleY]) {
              element.style.transform = m
                .clear()
                .t(-xForCenter, -yForCenter)
                .s(1 / parentScaleX, 1 / parentScaleY)
                .t(xForCenter, yForCenter)
                .t(x, y)
                .s(scaleX, scaleY)
                .css();
            },
            done() {
              element.style.transform = "";
              resolve();
            }
          },
          config.spring
        )
      );
    }, getStaggerBy());
  });
}
