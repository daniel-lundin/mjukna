/* Build a tree of all elements to animate to be able to calculate relative animations */

// function relativeRect(outer, inner) {
//   return {
//     left: inner.left - outer.left,
//     top: inner.top - outer.top,
//     width: inner.width,
//     height: inner.height
//   };
// }

// function multipleScale(parent, current) {
//   const s = {
//     x: current.x * parent.x,
//     y: current.y * parent.y
//   };
//   return s;
// }

export function withRelativeValues(tree) {
  return tree.map((node) => {
    const { previousPosition } = node;
    const newPosition = node.element.getBoundingClientRect();
    const scale = {
      x: previousPosition.width / newPosition.width,
      y: previousPosition.height / newPosition.height,
    };

    node.newPosition = newPosition;
    // node.parent
    //   ? relativeRect(node.parent.newPosition, newPosition)
    //   : newPosition;
    //node.parentScale = node.parent
    //  ? multipleScale(node.parent.scale, node.parent.parentScale)
    //   : { x: 1, y: 1 };
    node.scale = scale;

    node.leftDiff = node.currentLeftDiff =
      previousPosition.left - newPosition.left;
    node.topDiff = node.currentTopDiff = previousPosition.top - newPosition.top;

    node.xCenterDiff = node.currentXDiff =
      previousPosition.left +
      previousPosition.width / 2 -
      (newPosition.left + newPosition.width / 2);
    node.yCenterDiff = node.currentYDiff =
      previousPosition.top +
      previousPosition.height / 2 -
      (newPosition.top + newPosition.height / 2);

    // node.previousPosition = pre.parent
    //   ? relativeRect(node.parent.previousPosition, previousPosition)
    //   : previousPosition;
    node.children = withRelativeValues(node.children);
    return node;
  });
}

export function flatten(tree, items = []) {
  tree.forEach((n) => {
    items.push(n);
    flatten(n.children, items);
  });
  return items;
}

function reParent(nodes, parent) {
  nodes.forEach((node) => {
    node.parent = parent;
  });
  return nodes;
}
