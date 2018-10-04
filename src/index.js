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

const maybeTimeout2 = (mjuk, fn, timeout) => {
  timeout === 0 ? fn() : setTimeout(fn, timeout);
};

function idleElement(mjuk, fn, timeout) {
  let startTime = performance.now();
  function hover(time) {
    if (time - startTime > timeout) {
      fn();
    } else {
      const xForCenter = mjuk.newPosition.width / 2;
      const yForCenter = mjuk.newPosition.height / 2;
      const { parent } = mjuk;
      const currentParentScale = calculateParentScale(mjuk);
      mjuk.element.style.transform = m
        .clear()
        .t(-xForCenter, -yForCenter)
        .s(1 / currentParentScale.x, 1 / currentParentScale.y)
        .t(xForCenter, yForCenter)
        .t(
          (parent.xCenterDiff - parent.currentXDiff) * currentParentScale.x,
          (-parent.yCenterDiff - parent.currentYDiff) * currentParentScale.y
        )
        //          .t(x, y)
        .css();
      requestAnimationFrame(hover);
    }
  }
  requestAnimationFrame(hover);
}

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

function calculateParentScale(mjuk) {
  const scale = {
    x: 1,
    y: 1
  };
  let papa = mjuk.parent;
  while (papa) {
    scale.x *= papa.scale.x;
    scale.y *= papa.scale.y;
    papa = papa.parent;
  }
  return scale;
}

function relativeDiffs(mjuk) {
  const diffs = {
    xCenterDiff: mjuk.currentXDiff,
    yCenterDiff: mjuk.currentYDiff,
    leftDiff: mjuk.leftDiff,
    topDiff: mjuk.topDiff
  };
  let papa = mjuk.parent;
  while (papa) {
    diffs.xCenterDiff -= papa.currentXDiff;
    diffs.yCenterDiff -= papa.currentYDiff;
    diffs.leftDiff -= papa.leftDiff;
    diffs.topDiff -= papa.topDiff;
    papa = papa.parent;
  }
  return diffs;
}

function getCenterDiffs(mjuk) {
  return relativeDiffs(mjuk);
}

function FLIPScaleTranslate(mjuk, getStaggerBy) {
  const { element, newPosition, scale } = mjuk;

  const { xCenterDiff, yCenterDiff, leftDiff, topDiff } = getCenterDiffs(mjuk);
  const xForCenter = newPosition.width / 2;
  const yForCenter = newPosition.height / 2;

  const parentScale = calculateParentScale(mjuk);

  element.style.willChange = "transform";
  // console.log(scale.x, scale.y, xCenterDiff, yCenterDiff);
  const halfWidth = newPosition.width / 2;
  const halfHeight = newPosition.height / 2;
  const scaleCompensationX = halfWidth * (1 / parentScale.x - 1);
  const scaleCompensationY = halfHeight * (1 / parentScale.y - 1);

  console.log("==========");
  console.log(
    "halfWidth, halfHeight, scaleCompensationX, scaleCompensationY",
    halfWidth,
    halfHeight,
    scaleCompensationX,
    scaleCompensationY
  );
  console.log(
    "scale.x, scale.y, xCenterDiff, yCenterDiff",
    scale.x,
    scale.y,
    xCenterDiff,
    yCenterDiff
  );
  console.log(
    "mjuk.xCenterDiff, mjuk.yCenterDiff",
    mjuk.xCenterDiff,
    mjuk.yCenterDiff
  );

  element.style.transform = m
    .clear()
    .s(1 / parentScale.x, 1 / parentScale.y)
    .t(scaleCompensationX * parentScale.x, scaleCompensationY * parentScale.y)
    // .t(-xForCenter, -yForCenter)
    // .s(1 / parentScale.x, 1 / parentScale.y)
    // .t(xForCenter, yForCenter)
    .t(-xForCenter, -yForCenter)
    .s(scale.x, scale.y)
    .t(xForCenter, yForCenter)
    .t(leftDiff, topDiff) // * (1 / scale.x), yCenterDiff * (1 / scale.y))
    .css();
  console.log(element.style.transform);

  const progress = [element, void 0, () => {}];
  inProgress.push(progress);

  return new Promise(resolve => {
    progress[1] = maybeTimeout2(
      mjuk,
      () => {
        const { leftDiff, topDiff } = getCenterDiffs(mjuk);
        progress[2] = tween(
          Object.assign(
            {
              from: [leftDiff, topDiff, scale.x, scale.y],
              to: [0, 0, 1, 1, 1, 1],
              update([x, y, scaleX, scaleY]) {
                mjuk.scale.x = scaleX;
                mjuk.scale.y = scaleY;
                mjuk.currentLeftDiff = x;
                mjuk.currentTopDiff = y;

                const currentParentScale = calculateParentScale(mjuk);
                const scaleCompensationX =
                  halfWidth * (1 / currentParentScale.x - 1);
                const scaleCompensationY =
                  halfHeight * (1 / currentParentScale.y - 1);
                element.style.transform = m
                  .clear()
                  .s(1 / currentParentScale.x, 1 / currentParentScale.y)
                  .t(
                    scaleCompensationX * currentParentScale.x,
                    scaleCompensationY * currentParentScale.y
                  )
                  .t(-xForCenter, -yForCenter)
                  .s(scaleX, scaleY)
                  .t(xForCenter, yForCenter)
                  .t(x, y) // * (1 / scale.x), yCenterDiff * (1 / scale.y))
                  // .t(-xForCenter, -yForCenter)
                  // .s(1 / currentParentScale.x, 1 / currentParentScale.y)
                  // .t(xForCenter, yForCenter)
                  // .s(scaleX, scaleY)
                  // .t(x * scaleX, y * scaleY)
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
      },
      getStaggerBy()
    );
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
  const xCenterDiff = newPosition.left - previousPosition.left;
  const yCenterDiff = newPosition.top - previousPosition.top;
  element.style.willChange = "transform, opacity";
  element.style.top = `${-yCenterDiff}px`;
  element.style.left = `${-xCenterDiff}px`;

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
