let mjuka = [];

export function mjukna(element, config) {
  const item = {
    element,
    config,
    previousPosition: element.getBoundingClientRect()
  }
  mjuka.push(item);
  return () => { mjuka = mjuka.filter(mjuk => mjuk !== item) }
}

function positionsEqual(pos1, pos2) {
  return pos1.top === pos2.top && pos1.left === pos2.left;
}

function resetTransform(element) {
  element.style.transform = '';
  element.style.transition = '';
}

export function init(root = document) {
  const observer = new MutationObserver(mutations => {
    mjuka.forEach(mjuk => {
      // TODO: skip if mutation target is element
      const newPosition = mjuk.element.getBoundingClientRect();
      if (positionsEqual(newPosition, mjuk.previousPosition)) {
        return;
      }

      resetTransform(mjuk.element);

      const xDiff = mjuk.previousPosition.x - newPosition.x;
      const yDiff = mjuk.previousPosition.y - newPosition.y;

      mjuk.previousPosition = mjuk.element.getBoundingClientRect();
      square.style.transform = `translate(${xDiff}px, ${yDiff}px)`;

      requestAnimationFrame(() => {
        mjuk.element.style.transition = 'transform 0.3s';
        mjuk.element.style.transform = 'translate(0)';
      });
    });
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
  return () => observer.disconnect();
}
