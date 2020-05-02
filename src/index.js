import { tween } from "./spring.js";
import { createMatrix } from "./matrix.js";
import { fadeIn, fadeOut } from "./presets.js";

const m = createMatrix();
const rAF = window.requestAnimationFrame;

const observeConfig = {
  childList: true,
  subtree: true,
  attributes: true,
};

const maybeTimeout = (fn, timeout) =>
  timeout === 0 ? fn() : setTimeout(fn, timeout);

let nodes = [];
let config = {};
let observer;

let animationsInProgress = [];
let completionResolver = () => {};

function createProgress({ element, staggerTimer = 0, stopper = () => {} }) {
  return { element, staggerTimer, stopper };
}

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
      // animationsInProgress = animationsInProgress.filter(
      //   ({ e, staggerTimer, stopper }) => {
      //     if (e === getElement()) {
      //       clearInterval(staggerTimer);
      //       stopper();
      //     }
      //     return e !== getElement();
      //   }
      // );

      const getElement = item.anchor ? item.element : () => item;
      const node = createNode({
        getElement,
        previousPosition: item.anchor
          ? item.anchor.getBoundingClientRect()
          : getElement().getBoundingClientRect(),
      });
      nodes.push(node);
    }
  });
}

function init() {
  observer = new MutationObserver((mutations, index) => {
    observer.disconnect();

    nodes.forEach((node, index) => {
      node.readPosition();
      node.staggerBy = (config.staggerBy || 0) * index;
    });
    updateElements(nodes);

    return;

    let stagger = 0;
    const getStaggerBy = () => {
      const current = stagger;
      stagger += config.staggerBy;
      return current;
    };

    const childListMutations = mutations.filter(
      ({ type }) => type === "childList"
    );
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

function updateElements(activeNodes) {
  activeNodes.forEach(function connectParentChildren(
    currentNode,
    index,
    nodes
  ) {
    const parent = nodes.find((node) => {
      return (
        node !== currentNode &&
        node.getElement().contains(currentNode.getElement())
      );
    });

    if (parent) {
      parent.children.push(currentNode);
      currentNode.parent = parent;
    }
  });
  activeNodes.forEach(function setDepth(node) {
    let depth = 0;
    let n = node.parent;
    while (n) {
      depth++;
      n = n.parent;
    }
    node.depth = depth;
  });
  activeNodes.sort((a, b) => a.depth - b.depth);

  const animations = activeNodes.map((node) => FLIPScaleTranslate(node));

  // mjuka = [];
  return Promise.all(animations);
}

async function idleAt(node, value, predicate) {
  const element = node.getElement();
  return new Promise((done) => {
    function wait() {
      if (predicate()) {
        return done();
      }
      node.setValue(value);
      element.style.transform = node.getCSSTransform();
      rAF(wait);
    }
    rAF(wait);
  });
}

async function FLIPScaleTranslate(node) {
  const element = node.getElement();
  element.style.willChange = "transform";
  node.setValue(1);
  element.style.transform = node.getCSSTransform();

  if (node.staggerBy) {
    const now = Date.now();
    await idleAt(node, 1, () => Date.now() - now >= node.staggerBy);
  }

  return new Promise((resolve) => {
    tween({
      from: 1,
      to: 0,
      update(value) {
        node.setValue(value);
        element.style.transform = node.getCSSTransform();
      },
      async done() {
        node.setValue(0);
        node.completed = true;
        await idleAt(node, 0, () => !nodes.find((n) => !n.completed));
        element.style.transform = "";
        resolve();
      },
      ...config.spring,
    });
  });
}

function createNode({ getElement, previousPosition }) {
  let finalPosition;

  let centerOffsetX;
  let centerOffsetY;
  let centerDiffX;
  let centerDiffY;
  let scaleX;
  let scaleY;

  const node = {
    parent: null,
    children: [],
    depth: 0,
    staggerBy: 0,
    readPosition() {
      finalPosition = getElement().getBoundingClientRect();

      centerOffsetX = finalPosition.left + finalPosition.width / 2;
      centerOffsetY = finalPosition.top + finalPosition.height / 2;
      centerDiffX =
        finalPosition.left +
        finalPosition.width / 2 -
        (previousPosition.left + previousPosition.width / 2);
      centerDiffY =
        finalPosition.top +
        finalPosition.height / 2 -
        (previousPosition.top + previousPosition.height / 2);
      scaleX = previousPosition.width / finalPosition.width;
      scaleY = previousPosition.height / finalPosition.height;
    },
    getElement,
    previousPosition,
    finalPosition,
    currentValue: 0,
    currentOffsetX: 0,
    currentOffsetY: 0,
    setValue: (value) => {
      node.currentValue = value;

      const desiredOffsetX = centerDiffX * value;
      const actualOffsetX =
        desiredOffsetX + (node.parent ? node.parent.currentOffsetX : 0);
      const desiredOffsetY = centerDiffY * value;
      const actualOffsetY =
        desiredOffsetY + (node.parent ? node.parent.currentOffsetY : 0);

      node.currentOffsetX = desiredOffsetX - (actualOffsetX - desiredOffsetX);
      node.currentOffsetY = desiredOffsetY - (actualOffsetY - desiredOffsetY);
    },

    getParentScale: () => {
      if (!node.parent) return [1, 1];

      const [parentScaleX, parentScaleY] = node.parent.getParentScale();
      return [scaleX * parentScaleX, scaleY * parentScaleY];
    },

    getCSSTransform() {
      const parentScale = node.getParentScale();

      return m
        .clear()
        .t(-centerOffsetX, -centerOffsetY)
        .s(1 / parentScale[0], 1 / parentScale[1])
        .t(centerOffsetX, centerOffsetY)
        .t(-node.currentOffsetX, -node.currentOffsetY)
        .s(scaleX, scaleY)
        .css();
    },
    stop,
  };
  return node;
}

function enterAnimation(element) {
  element.style.willChange = "transform, opacity";

  return new Promise((resolve) => {
    maybeTimeout(() => {
      if (config.enterAnimation) return config.enterAnimation(element, resolve);
      fadeIn(element, config.spring, resolve);
    }, getStaggerBy());
  });
}

function exitAnimation(mjuk, previousParent) {
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

  return new Promise((resolve) => {
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
