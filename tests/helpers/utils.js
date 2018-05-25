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

const assertEqualPositions = (pos1, pos2) => {
  if (Object.keys(pos1).some(key => Math.abs(pos1[key] - pos2[key]) > 0.01))
    assert.deepStrictEqual(pos1, pos2);
};

const repeat = length => cb =>
  Array.from({ length }).forEach((_, index) => cb(index));

module.exports = {
  deepEquals,
  assertEqualPositions,
  sleep,
  repeat
};
