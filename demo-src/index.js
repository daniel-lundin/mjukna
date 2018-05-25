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
  {
    scale = false,
    tension = DEFAULT_TENSION,
    deceleration = DEFAULT_DECELERATION,
    staggerBy = 0
  } = {}
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
      targetPosition: element.getBoundingClientRect(),
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

function FLIPTranslate(mjuk, newPosition, index) {
  const {
    previousPosition,
    element,
    config: { tension, deceleration, staggerBy }
  } = mjuk;
  const xCenterDiff = previousPosition.x - newPosition.x;
  const yCenterDiff = previousPosition.y - newPosition.y;

  element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px)`;

  const progress = [element, void 0, () => {}];
  inProgress.push(progress);

  const runner =
    staggerBy === 0 ? fn => fn() : fn => setTimeout(fn, index * staggerBy);
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

function FLIPScaleTranslate(mjuk, newPosition, index) {
  const {
    previousPosition,
    element,
    config: { tension, deceleration, staggerBy }
  } = mjuk;
  const xCenterDiff =
    previousPosition.x +
    previousPosition.width / 2 -
    (newPosition.x + newPosition.width / 2);

  const yCenterDiff =
    previousPosition.y +
    previousPosition.height / 2 -
    (newPosition.y + newPosition.height / 2);

  const xScaleCompensation = previousPosition.width / newPosition.width;
  const yScaleCompensation = previousPosition.height / newPosition.height;

  mjuk.element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px) scale(${xScaleCompensation}, ${yScaleCompensation})`;

  const progress = [element, void 0, () => {}];
  inProgress.push(progress);

  const runner =
    staggerBy === 0 ? fn => fn() : fn => setTimeout(fn, index * staggerBy);
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

function buildTree(nodes, element, parent = null) {
  const foundParent = nodes.find(node => {
    return node.element.contains(element);
  });
  if (foundParent) {
    return nodes.map(node => {
      if (node === foundParent) {
        return {
          element: node.element,
          parent,
          children: buildTree(foundParent.children, element)
        };
      } else {
        return node;
      }
    });
  } else {
    const elementChildren = nodes.filter(node => {
      return element.contains(node.element);
    });
    const nonChildren = nodes.filter(node => {
      return !element.contains(node.element);
    });

    return [...nonChildren, { element, parent, children: elementChildren }];
  }
}

function updateElements() {
  const tree = mjuka.reduce((acc, { element }) => {
    const res = buildTree(acc, element);
    return res;
  }, []);

  mjuka.forEach((mjuk, index) => {
    if (
      positionsEqual(
        mjuk.element.getBoundingClientRect(),
        mjuk.previousPosition
      )
    ) {
      return;
    }

    mjuk.element.style.transform = "";
    const newPosition = mjuk.element.getBoundingClientRect();
    if (mjuk.config.scale) {
      FLIPScaleTranslate(mjuk, newPosition, index);
    } else {
      FLIPTranslate(mjuk, newPosition, index);
    }
  });
  mjuka = [];
}

function positionsEqual(pos1, pos2) {
  return (
    pos1.top === pos2.top &&
    pos1.left === pos2.left &&
    pos1.right === pos2.right &&
    pos1.bottom === pos2.bottom
  );
}
