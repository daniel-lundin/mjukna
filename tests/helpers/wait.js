const dumdom = require("./dumdom");
const { deepEquals, sleep } = require("./utils");

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

module.exports = {
  rafUntilStill
};
