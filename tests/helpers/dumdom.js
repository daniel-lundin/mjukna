const Element = require("./element.js");

const observers = [];
let rafCallbacks = [];
function MutationObserver(cb) {
  this.enabled = false;
  this.cb = cb;

  observers.push(this);
}

MutationObserver.prototype._notify = function() {
  if (this.enabled) this.cb([]);
};

MutationObserver.prototype.observe = function() {
  this.enabled = true;
};

MutationObserver.prototype.disconnect = function() {
  this.enabled = false;
};

function init() {
  global.window = {
    requestAnimationFrame(callback) {
      rafCallbacks.push(callback);
    }
  };

  global.MutationObserver = MutationObserver;
  global.document = new Element("body");
  global.document.triggerMutationObserver = function() {
    observers.forEach(o => o._notify());
  };
}

function triggerRAF() {
  rafCallbacks.forEach(c => setTimeout(c, 0));
  rafCallbacks = [];
}

function reset() {}

module.exports = {
  init,
  reset,
  triggerRAF
};
