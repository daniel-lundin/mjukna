const assert = require("assert");
const { feature } = require("kuta/lib/bdd");
const dumdom = require("../helpers/dumdom");
const { mjukna } = require("../../index.js");

function deepEquals(a, b) {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch (e) {
    return false;
  }
}
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

async function rafUntilStill(e) {
  let previousPosition = e.getBoundingClientRect();
  dumdom.triggerRAF();
  await sleep(1);

  while (!deepEquals(e.getBoundingClientRect(), previousPosition)) {
    previousPosition = e.getBoundingClientRect();
    dumdom.triggerRAF();
    await sleep(1);
  }
}
feature("basics", scenario => {
  scenario("adding elements", ({ before, after, given, when, then, and }) => {
    const scope = {};

    before(() => {
      dumdom.init();
    });

    after(() => {
      dumdom.reset();
    });

    given("a mjukt element", () => {
      const div = document.createElement("div");
      document.appendChild(div);
      scope.element = div;
      scope.previousPosition = div.getBoundingClientRect();
      mjukna(div);
    });

    when("an element is added", () => {
      document.prepend(document.createElement("h1"));
      document.triggerMutationObserver();
    });

    then("element should be in the same place", () => {
      const position = scope.element.getBoundingClientRect();
      assert.deepStrictEqual(scope.previousPosition, position);
    });

    and("eventually move in to its new place", async () => {
      await rafUntilStill(scope.element);
      const newPosition = scope.element.getBoundingClientRect();
      const expected = {
        top: 100,
        bottom: 200
      };
      assert.deepStrictEqual(newPosition.top, expected.top);
      assert.deepStrictEqual(newPosition.bottom, expected.bottom);
    });
  });
});
