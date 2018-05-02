const assert = require("assert");
const dumdom = require("./dumdom");

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

async function rafUntilStill(element) {
  let previousPosition = element.getBoundingClientRect();
  dumdom.triggerRAF();
  await sleep(0);

  while (!deepEquals(element.getBoundingClientRect(), previousPosition)) {
    previousPosition = element.getBoundingClientRect();
    dumdom.triggerRAF();
    await sleep(0);
    dumdom.triggerRAF();
    await sleep(0);
    dumdom.triggerRAF();
    await sleep(0);
  }
}
function deepEquals(a, b) {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  deepEquals,
  rafUntilStill
};
