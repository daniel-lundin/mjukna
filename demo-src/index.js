import tween from "https://unpkg.com/spring-array@1.2.4/src/index.js?module";
let mjuka = [];
let observer;

const observeConfig = {
  childList: true,
  subtree: true,
  attributes: true
};
const DEFAULT_TENSION = 0.1;
const DEFAULT_DECELERATION = 0.65;

let inProgress = [];

export function mjukna(
  elements,
  { scale = false, tension = DEFAULT_TENSION, deceleration = DEFAULT_DECELERATION, staggerBy = 0 } = {}
) {
  init();
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
      config: { scale, tension, deceleration, staggerBy },
      previousPosition: element.getBoundingClientRect(),
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

function FLIPTranslate(mjuk, index) {
  const { element, newPosition, previousPosition, config: { tension, deceleration, staggerBy } } = mjuk;
  const xCenterDiff = previousPosition.left - newPosition.left;
  const yCenterDiff = previousPosition.top - newPosition.top;

  element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px)`;

  const progress = [element, void 0, () => {}];
  inProgress.push(progress);

  const runner = staggerBy === 0 ? fn => fn() : fn => setTimeout(fn, index * staggerBy);
  progress[1] = runner(() => {
    progress[2] = tween({
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
  });
}

function FLIPScaleTranslate(mjuk, index) {
  const { element, previousPosition, newPosition, config: { tension, deceleration, staggerBy } } = mjuk;
  const xCenterDiff = previousPosition.left + previousPosition.width / 2 - (newPosition.left + newPosition.width / 2);

  const yCenterDiff = previousPosition.top + previousPosition.height / 2 - (newPosition.top + newPosition.height / 2);

  const xScaleCompensation = mjuk.scale.x; // previousPosition.width / newPosition.width;
  const yScaleCompensation = mjuk.scale.y; //previousPosition.height / newPosition.height;
  // const xScaleCompensation = previousPosition.width / newPosition.width;
  // const yScaleCompensation = previousPosition.height / newPosition.height;

  mjuk.element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px) scale(${xScaleCompensation}, ${yScaleCompensation})`;

  const progress = [element, void 0, () => {}];
  inProgress.push(progress);

  const runner = staggerBy === 0 ? fn => fn() : fn => setTimeout(fn, index * staggerBy);
  progress[1] = runner(() => {
    progress[2] = tween({
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
  });
}

function reParent(nodes, parent) {
  nodes.forEach(node => {
    node.parent = parent;
  });
  return nodes;
}

function buildTree(nodes, mjuk, parent = null) {
  const foundParent = nodes.find(node => {
    return node.element.contains(mjuk.element);
  });

  if (foundParent) {
    return nodes.map(node => {
      if (node === foundParent) {
        return Object.assign(node, {
          parent,
          children: buildTree(foundParent.children, mjuk)
        });
      } else {
        return node;
      }
    });
  } else {
    const elementChildren = nodes.filter(node => mjuk.element.contains(node.element));
    const nonChildren = nodes.filter(node => !mjuk.element.contains(node.element));

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
  return {
    x: current.x / parent.x,
    y: current.y / parent.y
  };
}

function withRelativeValues(tree) {
  return tree.map(node => {
    const { previousPosition } = node;
    node.element.style.transform = "";
    const newPosition = node.element.getBoundingClientRect();
    const scale = {
      x: previousPosition.width / newPosition.width,
      y: previousPosition.height / newPosition.height
    };
    node.newPosition = node.parent ? relativeRect(node.parent.newPosition, newPosition) : newPosition;
    node.scale = node.parent ? multipleScale(node.parent.scale, scale) : scale;
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

  flatTree.forEach((node, index) => {
    if (positionsEqual(node.newPosition, node.previousPosition)) {
      return;
    }

    if (node.config.scale) {
      FLIPScaleTranslate(node, index);
    } else {
      FLIPTranslate(node, index);
    }
  });
  mjuka = [];
}

function positionsEqual(pos1, pos2) {
  return pos1.top === pos2.top && pos1.left === pos2.left && pos1.right === pos2.right && pos1.bottom === pos2.bottom;
}
