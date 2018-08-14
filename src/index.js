import { tween } from "./spring.js";
import { createMatrix } from "./matrix.js";
import { fadeIn, fadeOut } from "./presets.js";
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
      enterAnimation: options.enterAnimation
    };
    const iterable = Number.isInteger(elements.length)
      ? elements
      : [].concat(elements);
    for (let item of iterable) {
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
    }
  });
}

function enterAnimation(element, getStaggerBy) {
  element.style.willChange = "transform, opacity";

  return new Promise(resolve => {
    maybeTimeout(() => {
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

  const newPosition = element.getBoundingClientRect();
  const xDiff = newPosition.left - previousPosition.left;
  const yDiff = newPosition.top - previousPosition.top;
  element.style.willChange = "transform, opacity";
  element.style.top = `${-yDiff}px`;
  element.style.left = `${-xDiff}px`;

  return new Promise(resolve => {
    maybeTimeout(() => {
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
      .filter(({ nodeType }) => nodeType === 1);

    const removed = [];
    for (const mutation of childListMutations) {
      for (const removedNode of mutation.removedNodes) {
        const mjuk = mjuka.find(mjuk => mjuk.getElement() === removedNode);
        const alsoAdded = addedNodes.includes(removedNode);
        if (mjuk && !alsoAdded) {
          removed.push([mjuk, mutation.target]);
        }
      }
    }

    const added = addedNodes
      .filter(e => config.enterFilter(e))
      .filter(node => !mjuka.find(m => node === m.getElement()));
    const present = mjuka.filter(mjuk => mjuk.getElement().parentNode);

    Promise.all(
      []
        .concat(
          removed.map(([element, previousParent]) =>
            exitAnimation(element, previousParent, getStaggerBy)
          )
        )
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
