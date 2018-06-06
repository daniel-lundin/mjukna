const { repeat } = require("./utils");
const { createMatris, fromCSS } = require("matris");
const PNG = require("node-png").PNG;

const whitespace = len => "".padStart(len);

function getTransforms(style) {
  if (!style.transform) {
    return createMatris(); // Identity
  }
  return fromCSS(style.transform);
}

function addClientRects(clientRect1, clientRect2) {
  return {
    top: clientRect1.top + clientRect2.top,
    bottom: clientRect1.bottom + clientRect2.top,
    left: clientRect1.left + clientRect2.left,
    right: clientRect1.right + clientRect2.left,
    width: clientRect1.width,
    height: clientRect1.height
  };
}

class Element {
  constructor(type, _parent) {
    this.type = type;
    this._parent = _parent;
    this.children = [];
    this.style = {
      display: "block",
      width: 100,
      height: 100
    };
  }

  prepend(element) {
    element._parent = this;
    this.children = [element, ...this.children];
  }

  appendChild(element) {
    element._parent = this;
    this.children = this.children.concat(element);
  }

  removeChild(element) {
    this.children = this.children.filter(child => child !== element);
  }

  contains(element) {
    return this.children.find(e => e === element || e.contains(element));
  }

  applyTransform(matris, x, y) {
    return [
      // matris[0] * x + matris[1] * y + matris[3],
      // matris[4] * x + matris[5] * y + matris[7]
      matris[0] * x + matris[4] * y + matris[12],
      matris[1] * x + matris[5] * y + matris[13]
    ];
  }

  getBoundingClientRect() {
    const transform = getTransforms(this.style);

    const [left, top] = this.applyTransform(
      transform,
      this._getLeft(),
      this._getTop()
    );
    const [right, bottom] = this.applyTransform(
      transform,
      this._getLeft() + this.style.width,
      this._getTop() + this.style.height
    );

    const clientRect = {
      top,
      bottom,
      left,
      right,
      width: right - left,
      height: bottom - top
    };
    if (this._parent) {
      return addClientRects(clientRect, this._parent.getBoundingClientRect());
    }
    return clientRect;
  }

  _rowHeights() {
    const elements = this._parent.children;
    return elements.reduce(
      (heights, element, index) => {
        if (index === 0) {
          return [[element.style.height, 1]];
        }
        if (isInline(elements[index - 1]) && isInline(element)) {
          const [maxHeight, columnCount] = heights[heights.length - 1];
          heights[heights.length - 1] = [
            Math.max(maxHeight, element.style.height),
            columnCount + 1
          ];
          return heights;
        }
        return heights.concat([[element.style.height, 1]]);
      },
      [[0, 0]]
    );
  }

  _getTop() {
    // I am the document
    if (!this._parent) return 0;

    const myIndex = this._parent.children.indexOf(this);
    const rowHeights = this._rowHeights();

    let height = 0;
    let elementIndex = 0;
    for (let i = 0; i < rowHeights.length; ++i) {
      const [rowHeight, columnCount] = rowHeights[i];
      if (elementIndex + columnCount > myIndex) {
        break;
      }
      height += rowHeight;
      elementIndex += columnCount;
    }
    return height + this._parent._getTop();
  }

  _getLeft() {
    if (!this._parent) return 0;

    const elements = this._parent.children;
    let myIndex = this._parent.children.indexOf(this);
    let left = 0;

    repeat(myIndex + 1)(index => {
      if (isInline(elements[index]) && isInline(elements[index - 1])) {
        left += elements[index - 1].style.width;
      } else {
        left = 0;
      }
    });
    return left;
  }

  createElement(type) {
    return new Element(type);
  }

  dump(level = 0) {
    const str = `${whitespace(level)} <${this.type} style={${JSON.stringify(
      this.style
    )}}>\n`;
    return this.children.reduce((s, c) => (s += c.dump(level + 1)), str);
  }

  dumpAsPng(width = 400, height = 400) {
    const png = new PNG({
      width,
      height
    });

    const colors = [[0, 255, 255], [255, 0, 255]];

    this.children.forEach((element, index) => {
      const box = element.getBoundingClientRect();
      const color = colors[index % colors.length];
      for (let x = box.left; x < box.left + box.width; ++x) {
        for (let y = box.top; y < box.top + box.height; ++y) {
          const idx = (width * Math.round(y) + Math.round(x)) * 4;
          png.data[idx] = color[0];
          png.data[idx + 1] = color[1];
          png.data[idx + 2] = color[2];
          png.data[idx + 3] = 255;
        }
      }
    });

    return png.pack();
  }
}

function isInline(element) {
  return element && element.style.display === "inline-block";
}

module.exports = Element;
