const assert = require("assert");
const { feature } = require("kuta/lib/bdd");
const dumdom = require("../helpers/dumdom");
const { mjukna } = require("../../index.js");
const { assertEqualPositions, sleep } = require("../helpers/utils");
const { rafUntilStill } = require("../helpers/wait");

feature("interruptions", scenario => {
  scenario("mutations while animations in progess", ({ before, after, given, when, then, and }) => {
    const scope = {};

    before(() => dumdom.init());
    after(() => dumdom.reset());

    given("a mjukt element", () => {
      const div = document.createElement("div");
      div.style.display = "inline-block";
      document.appendChild(div);
      scope.element = div;
      mjukna(div);
    });

    when("an inline-block element is added", () => {
      mjukna(scope.element);
      scope.firstAddition = document.createElement("div");

      scope.firstAddition.style.display = "inline-block";
      document.prepend(scope.firstAddition);
      document.triggerMutationObserver();
    });

    and("a few rAFs happen", async () => {
      dumdom.triggerRAF();
      scope.previousPosition = scope.element.getBoundingClientRect();
    });

    when("a new element is added", async () => {
      mjukna(scope.element);
      scope.secondAddition = document.createElement("div");

      document.prepend(scope.secondAddition);
      document.triggerMutationObserver();
    });

    then("the mjukt element should stay in place", async () => {
      const newPosition = scope.element.getBoundingClientRect();
      assertEqualPositions(newPosition, scope.previousPosition);
    });

    and("the element should move into its final place", async () => {
      await rafUntilStill(scope.element);
      const finalPosition = scope.element.getBoundingClientRect();
      assert.deepStrictEqual(finalPosition.left, 100);
      assert.deepStrictEqual(finalPosition.top, 100);
    });
  });

  scenario("scaling element while scale not completed", ({ before, after, given, when, then, and }) => {
    const scope = {};

    before(() => dumdom.init());
    after(() => dumdom.reset());

    given("a mjukt element", () => {
      const div = document.createElement("div");
      document.appendChild(div);
      scope.element = div;
      mjukna(div, { scale: true });
    });

    when("when element is resized", () => {
      mjukna(scope.element, { scale: true });
      scope.element.style.width = scope.element.style.height = 200;
      document.triggerMutationObserver();
    });

    and("a few rAFs happen", async () => {
      dumdom.triggerRAF();
      await sleep(0);
      scope.previousPosition = scope.element.getBoundingClientRect();
    });

    when("element is resized again", async () => {
      mjukna(scope.element, { scale: true });
      scope.element.style.width = scope.element.style.height = 300;
      document.triggerMutationObserver();
    });

    then("the mjukt element should stay in place", async () => {
      const newPosition = scope.element.getBoundingClientRect();
      assertEqualPositions(newPosition, scope.previousPosition);
    });

    and("the element should move into its final place", async () => {
      await rafUntilStill(scope.element);
      const finalPosition = scope.element.getBoundingClientRect();
      assert.deepStrictEqual(finalPosition.top, 0);
      assert.deepStrictEqual(finalPosition.left, 0);
      assert.deepStrictEqual(finalPosition.right, 300);
      assert.deepStrictEqual(finalPosition.bottom, 300);
    });
  });

  scenario("scaling up and down and up", ({ before, after, given, when, then, and }) => {
    const scope = {};

    before(() => dumdom.init());
    after(() => dumdom.reset());

    given("a mjukt element", () => {
      const div = document.createElement("div");
      document.appendChild(div);
      scope.element = div;
      mjukna(div, { scale: true });
    });

    when("the element is enlarged", () => {
      mjukna(scope.element, { scale: true });
      scope.element.style.height = 200;
      document.triggerMutationObserver();
    });

    then("the element should still be 100 height", () => {
      const { height, top } = scope.element.getBoundingClientRect();
      assert.deepStrictEqual(height, 100);
      assert.deepStrictEqual(top, 0);
    });

    and("a rAF happens", async () => {
      dumdom.triggerRAF();
      dumdom.triggerRAF();
      dumdom.triggerRAF();
      scope.previousPosition = scope.element.getBoundingClientRect();
    });

    when("the element is turned small again", () => {
      mjukna(scope.element, { scale: true });
      scope.element.style.height = 100;
      document.triggerMutationObserver();
    });

    then("the element should stay in place", async () => {
      const newPosition = scope.element.getBoundingClientRect();
      assert.deepStrictEqual(newPosition.height, scope.previousPosition.height);
      assertEqualPositions(newPosition.top, scope.previousPosition.top);
    });

    when("a rAF go by", () => {
      dumdom.triggerRAF();
      dumdom.triggerRAF();
      dumdom.triggerRAF();
      scope.previousPosition = scope.element.getBoundingClientRect();
    });

    when("the element is enlarged again", () => {
      mjukna(scope.element, { scale: true });
      scope.element.style.height = 200;
      document.triggerMutationObserver();
    });

    then("the mjukt element should stay in place", async () => {
      const newPosition = scope.element.getBoundingClientRect();
      assertEqualPositions(newPosition, scope.previousPosition);
    });

    and("eventually be full sized", async () => {
      await rafUntilStill(scope.element);
      const finalPosition = scope.element.getBoundingClientRect();
      assert.deepStrictEqual(finalPosition.height, 200);
    });
  });
});
