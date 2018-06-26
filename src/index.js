import tween from "spring-array";
import { createMatrix } from "./matrix.js";

const m = createMatrix();

const observeConfig = {
  childList: true,
  subtree: true,
  attributes: true
};
const DEFAULT_TENSION = 0.1;
const DEFAULT_DECELERATION = 0.6;

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

export default function mjukna(
  elements,
  {
    tension = DEFAULT_TENSION,
    deceleration = DEFAULT_DECELERATION,
    staggerBy = 0,
    enterFilter = () => false,
    exitFilter = () => false
  } = {}
) {
  enableObserver();
  return new Promise(resolve => {
    completionResolver = resolve;
    config.tension = tension;
    config.deceleration = deceleration;
    config.staggerBy = staggerBy;
    config.enterFilter = enterFilter;
    config.exitFilter = exitFilter;

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
          ? item.anchor().getBoundingClientRect()
          : getElement().getBoundingClientRect(),
        stop: () => {}
      };
      mjuka.push(mjuk);
    });
  });
}

function enterAnimation(element, getStaggerBy) {
  element.style.opacity = 0;
  element.style.transform = "scale(0.6)";

  maybeTimeout(() => {
    tween({
      from: [0, 0.4],
      to: [1, 1],
      update: ([opacity, scale]) => {
        element.style.opacity = opacity;
        element.style.transform = `scale(${scale})`;
      },
      done() {
        element.style.opacity = 1;
        element.style.transform = "";
      },
      tension: DEFAULT_TENSION,
      deceleration: DEFAULT_DECELERATION
    });
  }, getStaggerBy());
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
  element.style.transform = `translate(${-xDiff}px, ${-yDiff}px)`;

  maybeTimeout(() => {
    tween({
      from: [1, 1],
      to: [0.3, 0],
      update([scale, opacity]) {
        element.style.transform = `translate(${-xDiff}px, ${-yDiff}px) scale(${scale})`;
        element.style.opacity = opacity;
      },
      done() {
        document.body.removeChild(element);
      },
      tension: DEFAULT_TENSION,
      deceleration: DEFAULT_DECELERATION
    });
  }, getStaggerBy());
}

function init() {
  observer = new MutationObserver(mutations => {
    observer.disconnect();

    const staggerMaker = (function*() {
      let stagger = 0;
      while (true) {
        yield stagger;
        stagger += config.staggerBy;
      }
    })();
    const getStaggerBy = () => staggerMaker.next().value;

    const [addedNodes, removedNodes] = mutations
      .filter(({ type }) => type === "childList")
      .reduce(
        ([added, removed], curr) => {
          return [
            added.concat(
              Array.from(curr.addedNodes)
                .filter(({ nodeType }) => nodeType === 1)
                .filter(config.enterFilter)
            ),
            removed.concat(
              Array.from(curr.removedNodes)
                .filter(({ nodeType }) => nodeType === 1)
                .filter(config.exitFilter)
            )
          ];
        },
        [[], []]
      );

    const [present, removed] = mjuka.reduce(
      ([present, removed], mjuk) => {
        const element = mjuk.getElement();

        if (removedNodes.find(e => e === element)) {
          return [present, removed.concat(mjuk)];
        }
        return [present.concat(mjuk), removed];
      },
      [[], []]
    );

    const added = addedNodes.filter(
      node => !mjuka.find(m => node === m.getElement())
    );

    removed.forEach(element => exitAnimation(element, getStaggerBy));
    updateElements(present, getStaggerBy);
    added.forEach(element => enterAnimation(element, getStaggerBy));
  });
}

function reParent(nodes, parent) {
  nodes.forEach(node => {
    node.parent = parent;
  });
  return nodes;
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
  Promise.all(animations).then(completionResolver);
}

function buildTree(nodes, mjuk, parent) {
  mjuk.element.style.transform = "";

  const foundParent = nodes.find(node => {
    return node.element.contains(mjuk.element);
  });

  if (foundParent) {
    return nodes.map(node => {
      if (node === foundParent) {
        return Object.assign(node, {
          parent,
          children: buildTree(foundParent.children, mjuk, foundParent)
        });
      } else {
        return node;
      }
    });
  } else {
    const elementChildren = nodes.filter(node =>
      mjuk.element.contains(node.element)
    );
    const nonChildren = nodes.filter(
      node => !mjuk.element.contains(node.element)
    );

    const me = Object.assign(mjuk, { parent, children: elementChildren });
    reParent(me.children, me);
    return [...nonChildren, me];
  }
}
const relativeRect = (outer, inner) => ({
  left: inner.left - outer.left,
  top: inner.top - outer.top,
  width: inner.width,
  height: inner.height
});

function multipleScale(parent, current) {
  const s = {
    x: current.x * parent.x,
    y: current.y * parent.y
  };
  return s;
}

function withRelativeValues(tree) {
  return tree.map(node => {
    const { previousPosition } = node;
    const newPosition = node.element.getBoundingClientRect();
    const scale = {
      x: previousPosition.width / newPosition.width,
      y: previousPosition.height / newPosition.height
    };

    node.newPosition = node.parent
      ? relativeRect(node.parent.newPosition, newPosition)
      : newPosition;
    node.parentScale = node.parent
      ? multipleScale(node.parent.scale, node.parent.parentScale)
      : { x: 1, y: 1 };
    node.scale = scale;
    node.previousPosition = node.parent
      ? relativeRect(node.parent.previousPosition, previousPosition)
      : previousPosition;
    node.children = withRelativeValues(node.children);
    return node;
  });
}

function flatten(tree, items = []) {
  tree.forEach(n => {
    items.push(n);
    flatten(n.children, items);
  });
  return items;
}

function FLIPScaleTranslate(mjuk, getStaggerBy) {
  const { parentScale, element, previousPosition, newPosition } = mjuk;
  const { tension, deceleration } = config;
  const xCenterDiff =
    previousPosition.left +
    previousPosition.width / 2 -
    (newPosition.left + newPosition.width / 2);

  const yCenterDiff =
    previousPosition.top +
    previousPosition.height / 2 -
    (newPosition.top + newPosition.height / 2);

  const xScaleCompensation = mjuk.scale.x;
  const yScaleCompensation = mjuk.scale.y;

  const xForCenter = newPosition.left + newPosition.width / 2;
  const yForCenter = newPosition.top + newPosition.height / 2;

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
      progress[2] = tween({
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
        },
        tension,
        deceleration
      });
    }, getStaggerBy());
  });
}
