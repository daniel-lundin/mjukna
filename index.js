import tween from "https://unpkg.com/spring-array@1.2.4/src/index.js?module";
let mjuka = [];
let disconnector;
let observer;
let _root;
const observeConfig = {
  childList: true,
  subtree: true,
  attributes: true
};
const tension = 0.1;
const deceleration = 0.65;

function unObserved(fn) {
  disconnector();
  fn();
  observer.observe(_root, observeConfig);
}

export function mjukna(element, config = { scale: false }) {
  if (mjuka.length === 0) {
    disconnector = init();
  }
  const item = {
    element,
    config,
    previousPosition: element.getBoundingClientRect(),
    targetPosition: element.getBoundingClientRect(),
    animationOffsets: {
      x: 0,
      y: 0,
      widthDiff: 0,
      heightDiff: 0
    },
    stop: () => {}
  };
  mjuka.push(item);
  return () => {
    mjuka = mjuka.filter(mjuk => mjuk !== item);
    if (mjuka.length === 0) {
      disconnector();
    }
  };
}

function init(root = document) {
  _root = root;
  observer = new MutationObserver(mutations => {
    const addedNodes = mutations.reduce(
      (added, mutation) => added.concat(...mutation.addedNodes),
      []
    );

    addedNodes.forEach(node => {
      if (node.tagName === "IMG") {
        node.addEventListener("load", () => {
          updateElements();
        });
      }
    });

    updateElements();
  });

  observer.observe(root, observeConfig);
  return () => observer.disconnect();
}

function FLIPTranslate(mjuk, newPosition) {
  const { previousPosition, element, animationOffsets } = mjuk;
  // mjuk.targetPosition = newPosition;
  const xCenterDiff = previousPosition.x - newPosition.x + animationOffsets.x;
  const yCenterDiff = previousPosition.y - newPosition.y + animationOffsets.y;

  unObserved(() => {
    element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px)`;
  });

  mjuk.stop();
  const stopper = tween({
    from: [xCenterDiff, yCenterDiff],
    to: [0, 0],
    update([x, y]) {
      unObserved(() => {
        element.style.transform = `translate(${x}px, ${y}px)`;
        animationOffsets.x = newPosition.left + x;
        animationOffsets.y = newPosition.top + y;
      });
    },
    done() {
      unObserved(() => {
        element.style.transform = "";
      });
      mjuk.previousPosition = element.getBoundingClientRect();
      animationOffsets.x = 0;
      animationOffsets.y = 0;
    },
    tension,
    deceleration
  });

  mjuk.stop = stopper;
}

function FLIPScaleTranslate(mjuk, newPosition) {
  const { previousPosition, element } = mjuk;
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

  unObserved(() => {
    mjuk.element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px) scale(${xScaleCompensation}, ${yScaleCompensation})`;
  });

  mjuk.stop();
  const stopper = tween({
    from: [xCenterDiff, yCenterDiff, xScaleCompensation, yScaleCompensation],
    to: [0, 0, 1, 1],
    update([x, y, scaleX, scaleY]) {
      unObserved(() => {
        element.style.transform = `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
        mjuk.previousPosition = element.getBoundingClientRect();
      });
    },
    done() {
      unObserved(() => {
        element.style.transform = "";
      });
      mjuk.previousPosition = element.getBoundingClientRect();
    },
    tension,
    deceleration
  });
  mjuk.stop = stopper;
}

function updateElements() {
  mjuka.forEach(mjuk => {
    // TODO: listen to attributes and skip if mutation target is element
    if (
      positionsEqual(
        mjuk.element.getBoundingClientRect(),
        mjuk.previousPosition
      )
    ) {
      return;
    }

    unObserved(() => {
      mjuk.element.style.transform = "";
    });
    const newPosition = mjuk.element.getBoundingClientRect();
    if (mjuk.config.scale) {
      FLIPScaleTranslate(mjuk, newPosition);
    } else {
      FLIPTranslate(mjuk, newPosition);
    }
  });
}

function positionsEqual(pos1, pos2) {
  return (
    pos1.top === pos2.top &&
    pos1.left === pos2.left &&
    pos1.right === pos2.right &&
    pos1.bottom === pos2.bottom
  );
}
