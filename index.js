import tween from "https://unpkg.com/spring-array@1.1.1/src/index.js?module";
let mjuka = [];
let disconnector;

export function mjukna(element, config = { scale: false }) {
  if (mjuka.length === 0) {
    disconnector = init();
  }
  const item = {
    element,
    config,
    previousPosition: element.getBoundingClientRect()
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
  const observer = new MutationObserver(mutations => {
    const addedNodes = mutations.reduce(
      (added, mutation) => added.concat(...mutation.addedNodes),
      []
    );

    addedNodes.forEach(node => {
      if (node.tagName === "IMG") {
        node.addEventListener("load", () => {
          updateElements([]);
        });
      }
    });

    updateElements(addedNodes);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
  });
  return () => observer.disconnect();
}
function FLIPTranslate(mjuk, newPosition) {
  const { previousPosition, element } = mjuk;
  const xCenterDiff = previousPosition.x - newPosition.x;
  const yCenterDiff = previousPosition.y - newPosition.y;

  mjuk.element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px)`;

  tween({
    from: [xCenterDiff, yCenterDiff],
    to: [0, 0],
    update([x, y]) {
      element.style.transform = `translate(${x}px, ${y}px)`;
    },
    done() {
      mjuk.previousPosition = element.getBoundingClientRect();
    },
    tension: 0.1,
    deceleration: 0.7
  });
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

  mjuk.element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px) scale(${xScaleCompensation}, ${yScaleCompensation})`;

  tween({
    from: [xCenterDiff, yCenterDiff, xScaleCompensation, yScaleCompensation],
    to: [0, 0, 1, 1],
    update([x, y, scaleX, scaleY]) {
      element.style.transform = `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
    },
    done() {
      mjuk.previousPosition = element.getBoundingClientRect();
    },
    tension: 0.1,
    deceleration: 0.7
  });
}
function updateElements(addedNodes) {
  mjuka.forEach(mjuk => {
    const { element } = mjuk;

    if (addedNodes.includes(mjuk.element)) {
      // Entry animation
      mjuk.previousPosition = element.getBoundingClientRect();
      const value = [-30, 0];
      tween({
        from: value,
        to: [0, 1],
        update: ([y, opacity]) => {
          element.style.transform = `translateY(${y}px)`;
          element.style.opacity = opacity;
        },
        tension: 0.1,
        deceleration: 0.7
      });
      return;
    }

    // TODO: listen to attributes and skip if mutation target is element
    const newPosition = mjuk.element.getBoundingClientRect();
    if (positionsEqual(newPosition, mjuk.previousPosition)) {
      return;
    }

    if (mjuk.config.scale) {
      FLIPScaleTranslate(mjuk, newPosition);
    } else {
      FLIPTranslate(mjuk, newPosition);
    }
  });
}

function positionsEqual(pos1, pos2) {
  return pos1.top === pos2.top && pos1.left === pos2.left;
}
