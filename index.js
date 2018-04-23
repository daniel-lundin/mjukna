import tween from "https://unpkg.com/spring-array@1.1.1/src/index.js?module";
let mjuka = [];

const easing = "cubic-bezier(.26,1.53,.52,.91)";

export function mjukna(element, config = { scale: false }) {
  const item = {
    element,
    config,
    previousPosition: element.getBoundingClientRect()
  };
  mjuka.push(item);
  return () => {
    mjuka = mjuka.filter(mjuk => mjuk !== item);
  };
}

function positionsEqual(pos1, pos2) {
  return pos1.top === pos2.top && pos1.left === pos2.left;
}

function resetTransform(element) {
  element.style.transform = "";
  element.style.transition = "";
}

export function init(root = document) {
  const observer = new MutationObserver(mutations => {
    observer.disconnect();
    const addedNodes = mutations.reduce(
      (added, mutation) => added.concat(...mutation.addedNodes),
      []
    );
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class"]
        });
      })
    );

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

      resetTransform(mjuk.element);

      const xCenterDiff =
        mjuk.previousPosition.x +
        mjuk.previousPosition.width / 2 -
        (newPosition.x + newPosition.width / 2);
      const yCenterDiff =
        mjuk.previousPosition.y +
        mjuk.previousPosition.height / 2 -
        (newPosition.y + newPosition.height / 2);
      const xScaleCompensation =
        mjuk.previousPosition.width / newPosition.width;
      const yScaleCompensation =
        mjuk.previousPosition.height / newPosition.height;

      mjuk.previousPosition = mjuk.element.getBoundingClientRect();
      mjuk.element.style.transform = `translate(${xCenterDiff}px, ${yCenterDiff}px) scale(${xScaleCompensation}, ${yScaleCompensation})`;

      tween({
        from: [
          xCenterDiff,
          yCenterDiff,
          xScaleCompensation,
          yScaleCompensation
        ],
        to: [0, 0, 1, 1],
        update: ([x, y, scaleX, scaleY]) => {
          element.style.transform = `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
        },
        tension: 0.1,
        deceleration: 0.7
      });
    });
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
  });
  return () => observer.disconnect();
}
