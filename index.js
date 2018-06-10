import tween from "https://unpkg.com/spring-array@1.2.4/src/index.js?module";
import {
  createMatris,
  scale,
  translate,
  clear,
  asCSS
} from "https://unpkg.com/matris@0.0.7/index.mjs?module";
let mjuka = [];
let observer;

const matris = createMatris();

const observeConfig = {
  childList: true,
  subtree: true,
  attributes: true
};
const DEFAULT_TENSION = 0.1;
const DEFAULT_DECELERATION = 0.65;

let inProgress = [];
let completionResolver = () => {};

export default function mjukna(
  elements,
  {
    tension = DEFAULT_TENSION,
    deceleration = DEFAULT_DECELERATION,
    staggerBy = 0
  } = {}
) {
  init();
  return new Promise(resolve => {
    completionResolver = resolve;
    [].concat(elements).forEach(element => {
      // Stop any running animations for element
      inProgress = inProgress.filter(([e, staggerTimer, stopper]) => {
        if (e === element) {
          clearInterval(staggerTimer);
          stopper();
        }
        return e !== element;
      });

      const item = {
        element,
        config: { tension, deceleration, staggerBy },
        previousPosition: element.getBoundingClientRect(),
        stop: () => {}
      };
      mjuka.push(item);
    });
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

function FLIPScaleTranslate(mjuk, index) {
  const {
    parentScale,
    element,
    previousPosition,
    newPosition,
    config: { tension, deceleration, staggerBy }
  } = mjuk;
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

  clear(matris);
  // Parent compensation
  translate(matris, -xForCenter, -yForCenter);
  scale(matris, 1 / parentScale.x, 1 / parentScale.y);
  translate(matris, xForCenter, yForCenter);
  // Actual FLIP
  translate(matris, xCenterDiff, yCenterDiff);
  scale(matris, xScaleCompensation, yScaleCompensation);
  element.style.transform = asCSS(matris);

  const progress = [element, void 0, () => {}];
  inProgress.push(progress);

  const runner =
    staggerBy === 0 ? fn => fn() : fn => setTimeout(fn, index * staggerBy);
  return new Promise(resolve => {
    progress[1] = runner(() => {
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
          clear(matris);
          // Parent compensation
          translate(matris, -xForCenter, -yForCenter);
          scale(matris, 1 / parentScaleX, 1 / parentScaleY);
          translate(matris, xForCenter, yForCenter);
          // Actual FLIP
          translate(matris, x, y);
          scale(matris, scaleX, scaleY);
          element.style.transform = asCSS(matris);
        },
        done() {
          element.style.transform = "";
          resolve();
        },
        tension,
        deceleration
      });
    });
  });
}

function reParent(nodes, parent) {
  nodes.forEach(node => {
    node.parent = parent;
  });
  return nodes;
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

function updateElements() {
  const tree = mjuka.reduce((acc, mjuk) => buildTree(acc, mjuk), []);
  const flatTree = flatten(withRelativeValues(tree));

  const animations = flatTree.map(FLIPScaleTranslate);
  Promise.all(animations).then(completionResolver);
  mjuka = [];
}
