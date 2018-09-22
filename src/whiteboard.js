/* Build a tree of all elements to animate to be able to calculate relative animations */

export function buildTree(nodes, mjuk, parent) {
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

function relativeRect(outer, inner) {
  return {
    left: inner.left - outer.left,
    top: inner.top - outer.top,
    width: inner.width,
    height: inner.height
  };
}

// function multipleScale(parent, current) {
//   const s = {
//     x: current.x * parent.x,
//     y: current.y * parent.y
//   };
//   return s;
// }

export function withRelativeValues(tree) {
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
    //node.parentScale = node.parent
    //  ? multipleScale(node.parent.scale, node.parent.parentScale)
    //   : { x: 1, y: 1 };
    node.scale = scale;
    node.previousPosition = node.parent
      ? relativeRect(node.parent.previousPosition, previousPosition)
      : previousPosition;
    node.children = withRelativeValues(node.children);
    return node;
  });
}

export function flatten(tree, items = []) {
  tree.forEach(n => {
    items.push(n);
    flatten(n.children, items);
  });
  return items;
}

function reParent(nodes, parent) {
  nodes.forEach(node => {
    node.parent = parent;
  });
  return nodes;
}
