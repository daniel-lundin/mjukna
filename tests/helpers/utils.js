const assert = require("assert");

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function deepEquals(a, b) {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch (e) {
    return false;
  }
}

const repeat = length => cb => Array.from({ length }).forEach((_, index) => cb(index));

module.exports = {
  deepEquals,
  sleep,
  repeat
};
