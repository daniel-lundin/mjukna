let mjuka = [];

const easing = "cubic-bezier(.26,1.53,.52,.91)";

export function mjukna(element, config) {
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
    const addedNodes = mutations.reduce(
      (added, mutation) => added.concat(...mutation.addedNodes),
      []
    );

    mjuka.forEach(mjuk => {
      const { element } = mjuk;

      if (addedNodes.includes(mjuk.element)) {
        // Entry animation
        mjuk.previousPosition = element.getBoundingClientRect();
        element.style.transform = "translateY(-30px)";
        element.style.opacity = 0;
        requestAnimationFrame(() => {
          element.style.transition = "transform 0.3s, opacity 0.3s";
          element.style.transitionTimingFunction = easing;
          element.style.transform = "translate(0)";
          element.style.opacity = 1;
        });
        return;
      }

      // TODO: listen to attributes and skip if mutation target is element
      const newPosition = mjuk.element.getBoundingClientRect();
      if (positionsEqual(newPosition, mjuk.previousPosition)) {
        return;
      }

      resetTransform(mjuk.element);

      const xDiff = mjuk.previousPosition.x - newPosition.x;
      const yDiff = mjuk.previousPosition.y - newPosition.y;

      mjuk.previousPosition = mjuk.element.getBoundingClientRect();
      mjuk.element.style.transform = `translate(${xDiff}px, ${yDiff}px)`;

      requestAnimationFrame(() => {
        element.style.transitionProperty = "transform";
        element.style.transitionDuration = "0.3s";
        element.style.transitionTimingFunction = easing;
        element.style.transform = "translate(0)";
      });
    });
  });

  observer.observe(root, {
    childList: true,
    subtree: true
  });
  return () => observer.disconnect();
}
