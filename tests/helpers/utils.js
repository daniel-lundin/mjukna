const path = require("path");
const assert = require("assert");
const rollup = require("rollup");
const rollupConfig = require(path.join(__dirname, "../../rollup.config.js"))
  .default;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function deepEquals(a, b) {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch (e) {
    return false;
  }
}

async function getMjuknaCode() {
  const bundle = await rollup.rollup(rollupConfig);
  const { code } = await bundle.generate(rollupConfig);
  return code;
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
  repeat,
  getMjuknaCode
};
