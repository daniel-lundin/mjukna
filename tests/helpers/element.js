const { repeat } = require("./utils");
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

function Element(type, _parent) {
  this.type = type;
  this._parent = _parent;
  this.children = [];
  this.style = {
    display: "block",
    width: 100,
    height: 100
  };
}

Element.prototype.prepend = function(element) {
  element._parent = this;
  this.children = [element, ...this.children];
};

Element.prototype.appendChild = function(element) {
  element._parent = this;
  this.children = this.children.concat(element);
};

Element.prototype.removeChild = function(element) {
  this.children = this.children.filter(child => child !== element);
};

Element.prototype.getBoundingClientRect = function() {
  const { x: extraX, y: extraY, scaleX, scaleY } = getTransformOffsets(this.style);

  const width = this.style.width * scaleX;
  const height = this.style.height * scaleY;
  const centerX = this._getLeft() + this.style.width / 2 + extraX;
  const centerY = this._getTop() + this.style.height / 2 + extraY;
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
};

function isInline(element) {
  return element && element.style.display === "inline-block";
}

Element.prototype._rowHeights = function() {
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
};

Element.prototype._getTop = function() {
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
};

Element.prototype._getLeft = function() {
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
};

Element.prototype.createElement = function(type) {
  return new Element(type);
};

Element.prototype.dump = function(level = 0) {
  const str = `${whitespace(level)} <${this.type} style={${JSON.stringify(this.style)}}>\n`;
  return this.children.reduce((s, c) => (s += c.dump(level + 1)), str);
};

module.exports = Element;
