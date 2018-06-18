import tween from "spring-array";

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
    enterAnimation = false,
    exitAnimation = false
  } = {}
) {
  enableObserver();
  return new Promise(resolve => {
    completionResolver = resolve;
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
        config: {
          tension,
          deceleration,
          staggerBy,
          enterAnimation,
          exitAnimation
        },
        previousPosition: item.anchor
          ? item.anchor().getBoundingClientRect()
          : getElement().getBoundingClientRect(),
        stop: () => {}
      };
      mjuka.push(mjuk);
    });
  });
}

function enterAnimation(element) {
  element.style.opacity = 0;
  element.style.transform = "scale(0.4)";

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
}

function exitAnimation(mjuk) {
  const { previousPosition } = mjuk;
  const element = mjuk.getElement();
  document.body.appendChild(element);
  element.style.position = "absolute";

  const newPosition = element.getBoundingClientRect();
  const xDiff = newPosition.left - previousPosition.left;
  const yDiff = newPosition.top - previousPosition.top;
  element.style.transform = `translate(${-xDiff}px, ${-yDiff}px)`;

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
}

function init() {
  observer = new MutationObserver(mutations => {
    observer.disconnect();

    const [addedNodes, removedNodes] = mutations
      .filter(({ type }) => type === "childList")
      .reduce(
        ([added, removed], curr) => {
          return [
            added.concat(Array.from(curr.addedNodes)),
            removed.concat(Array.from(curr.removedNodes))
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

    added.forEach(enterAnimation);
    removed.forEach(exitAnimation);
    updateElements(present);
  });
}

function reParent(nodes, parent) {
  nodes.forEach(node => {
    node.parent = parent;
  });
  return nodes;
}

function updateElements(activeMjuka) {
  const tree = activeMjuka
    .map(mjuk => Object.assign(mjuk, { mjuk, element: mjuk.getElement() }))
    .reduce((acc, mjuk) => buildTree(acc, mjuk), []);
  const flatTree = flatten(withRelativeValues(tree));

  const animations = flatTree.map(FLIPScaleTranslate);

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
function translatedScale(x, y, sX, sY) {
  return `translate(${-x}px, ${-y}px) scale(${sX}, ${sY}) translate(${x}px, ${y}px) `;
}
function translateScale(x, y, sX, sY) {
  return `translate(${x}px, ${y}px) scale(${sX}, ${sY}) `;
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

  element.style.transform =
    translatedScale(
      xForCenter,
      yForCenter,
      1 / parentScale.x,
      1 / parentScale.y
    ) +
    translateScale(
      xCenterDiff,
      yCenterDiff,
      xScaleCompensation,
      yScaleCompensation
    );

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
          element.style.transform =
            translatedScale(
              xForCenter,
              yForCenter,
              1 / parentScaleX,
              1 / parentScaleY
            ) + translateScale(x, y, scaleX, scaleY);
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
