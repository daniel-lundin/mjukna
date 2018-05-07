const assert = require("assert");
const { feature } = require("kuta/lib/bdd");
const dumdom = require("../helpers/dumdom");
const { mjukna } = require("../../index.js");
const { repeat } = require("../helpers/utils");
const { rafUntilStill } = require("../helpers/wait");

feature("basics", scenario => {
  scenario("adding elements", ({ before, after, given, when, then, and }) => {
    const scope = {};

    before(() => dumdom.init());
    after(() => dumdom.reset());

    given("a mjukt element", () => {
      const div = document.createElement("div");
      div.style.display = "inline-block";
      document.appendChild(div);
      scope.element = div;
      scope.previousPosition = div.getBoundingClientRect();
      mjukna(div);
    });

    when("a h1 is added and an inline block is added", () => {
      scope.inline = document.createElement("div");
      scope.inline.style.display = "inline-block";
      document.prepend(scope.inline);
      scope.h1 = document.createElement("h1");
      scope.h1.style.height = 50;
      document.prepend(scope.h1);
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
        top: scope.h1.style.height,
        left: scope.inline.style.width,
        bottom: scope.h1.style.height + scope.element.style.height
      };
      assert.deepStrictEqual(newPosition.top, expected.top);
      assert.deepStrictEqual(newPosition.bottom, expected.bottom);
    });
  });

  scenario("resizing elements", ({ before, after, given, when, then, and }) => {
    const elements = [];
    const startPositions = [];

    before(() => dumdom.init());
    after(() => dumdom.reset());

    given("three mjukt elements", () => {
      repeat(2)(() => {
        const div = document.createElement("div");
        div.style.display = "inline-block";
        document.appendChild(div);
        elements.push(div);
        startPositions.push(div.getBoundingClientRect());
        mjukna(div, { scale: true });
      });

      const div = document.createElement("div");
      document.appendChild(div);
      mjukna(div, { scale: true });
      elements.push(div);
      startPositions.push(div.getBoundingClientRect());
    });

    when("elements are resized", () => {
      elements[0].style.width = 200;
      elements[1].style.height = 200;
      elements[2].style.height = 200;
      document.triggerMutationObserver();
    });

    then("elements should stay in place", () => {
      elements.forEach((element, index) => {
        assert.deepStrictEqual(
          element.getBoundingClientRect(),
          startPositions[index]
        );
      });
    });

    and("eventually move into its new places", async () => {
      await rafUntilStill(elements[0]);
      const expectedPositions = [
        { top: 0, right: 200, bottom: 100 },
        { top: 0, left: 200, bottom: 200 },
        { top: 200, bottom: 400, left: 0, right: 100 }
      ];

      expectedPositions.forEach((expectedPosition, index) => {
        const newPosition = elements[index].getBoundingClientRect();
        Object.keys(expectedPosition).forEach(key => {
          assert.deepStrictEqual(newPosition[key], expectedPosition[key]);
        });
      });
    });
  });

  scenario("removing elements", ({ before, after, given, when, then, and }) => {
    const scope = {};

    before(() => {
      dumdom.init();
    });

    after(() => {
      dumdom.reset();
    });

    given("an element and a mjukt element", () => {
      scope.firstElement = document.createElement("div");
      document.appendChild(scope.firstElement);
      const div = document.createElement("div");
      document.appendChild(div);
      scope.element = div;
      scope.previousPosition = div.getBoundingClientRect();
      mjukna(div);
    });

    when("an element is removed", () => {
      document.removeChild(scope.firstElement);
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
        top: 0,
        bottom: 100
      };
      assert.deepStrictEqual(newPosition.top, expected.top);
      assert.deepStrictEqual(newPosition.bottom, expected.bottom);
    });
  });
});
