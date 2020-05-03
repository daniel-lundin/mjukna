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
  observer = new MutationObserver(() => {
    observer.disconnect();

    nodes.forEach((node, index) => {
      node.readPosition();
      node.staggerBy = (config.staggerBy || 0) * index;
    });
    updateElements(nodes).then(() => {
      nodes = [];
      completionResolver();
    });
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

  window.nodes = nodes;
  // nodes[0].setValue(0.5);
  // nodes[0].getElement().style.transform = nodes[0].getCSSTransform();
  // nodes[1].setValue(1);
  // nodes[1].getElement().style.transform = nodes[1].getCSSTransform();
  // return;

  const animations = activeNodes.map((node) => FLIPScaleTranslate(node));

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

  window.nodes = nodes;

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

  let offsetFromCenterX;
  let offsetFromCenterY;
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

      offsetFromCenterX = finalPosition.width - finalPosition.width / 2;
      offsetFromCenterY = finalPosition.height - finalPosition.height / 2;
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

      node.currentScaleX = scaleX * value + 1 - value;
      node.currentScaleY = scaleY * value + 1 - value;

      node.currentOffsetX =
        -(centerDiffX + (node.parent ? node.parent.currentOffsetX : 0)) * value;
      node.currentOffsetY =
        -(centerDiffY + (node.parent ? node.parent.currentTopOffset : 0)) *
        value;
    },

    getParentScale: () => {
      let scaleX = 1;
      let scaleY = 1;
      let parent = node.parent;
      while (parent) {
        scaleX *= parent.currentScaleX;
        scaleY *= parent.currentScaleY;
        parent = parent.parent;
      }
      return [scaleX, scaleY];
    },

    getCSSTransform() {
      const parentScale = node.getParentScale();
      return m
        .clear()
        .t(-offsetFromCenterX, -offsetFromCenterY)
        .s(1 / parentScale[0], 1 / parentScale[1])
        .t(offsetFromCenterX, offsetFromCenterY)
        .t(node.currentOffsetX, node.currentOffsetY)
        .s(node.currentScaleX, node.currentScaleY)
        .css();
    },
    stop,
  };
  return node;
}
