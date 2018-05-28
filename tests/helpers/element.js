const { repeat } = require("./utils");
const PNG = require("node-png").PNG;

const whitespace = len => "".padStart(len);

function getTranslateOffsets(style) {
  const translateRegEx = /translate\((-?.*)px, (-?.*)px\)/;
  if (!translateRegEx.test(style.transform)) {
    return { x: 0, y: 0 };
  }
  const [x, y] = style.transform.match(translateRegEx).slice(1, 3);
  return { x: +x, y: +y };
}

function getScaleTransform(style) {
  const scaleRegEx = /scale\((.*), (.*)\)/;
  if (!scaleRegEx.test(style.transform)) {
    return { scaleX: 1, scaleY: 1 };
  }
  const [x, y] = style.transform.match(scaleRegEx).slice(1, 3);
  return { scaleX: +x, scaleY: +y };
}

function getTransformOffsets(style) {
  if (!style.transform) {
    return { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  }
  return Object.assign({}, getTranslateOffsets(style), getScaleTransform(style));
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

  getBoundingClientRect() {
    const { x: translateX, y: translateY, scaleX, scaleY } = getTransformOffsets(this.style);

    const width = this.style.width * scaleX;
    const height = this.style.height * scaleY;
    const centerX = this._getLeft() + this.style.width / 2 + translateX;
    const centerY = this._getTop() + this.style.height / 2 + translateY;
    const left = centerX - width / 2;
    const right = centerX + width / 2;
    const top = centerY - height / 2;

    return {
      x: left,
      y: top,
      top,
      bottom: top + height,
      left,
      right,
      width,
      height
    };
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
          heights[heights.length - 1] = [Math.max(maxHeight, element.style.height), columnCount + 1];
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
    const str = `${whitespace(level)} <${this.type} style={${JSON.stringify(this.style)}}>\n`;
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
