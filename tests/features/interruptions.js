const assert = require("assert");
const { feature } = require("kuta/lib/bdd");
const dumdom = require("../helpers/dumdom");
const { mjukna } = require("../../index.js");
const { sleep } = require("../helpers/utils");
const { rafUntilStill } = require("../helpers/wait");

feature("interruptions", scenario => {
  scenario(
    "mutations while animations in progess",
    ({ before, after, given, when, then, and }) => {
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
        scope.firstAddition = document.createElement("div");

        scope.firstAddition.style.display = "inline-block";
        document.prepend(scope.firstAddition);
        document.triggerMutationObserver();
      });

      and("a few rAFs happen", async () => {
        dumdom.triggerRAF();
        await sleep(0);
        dumdom.triggerRAF();
        await sleep(0);
        scope.previousPosition = scope.element.getBoundingClientRect();
      });

      when("a new element is added", async () => {
        scope.secondAddition = document.createElement("div");

        document.prepend(scope.secondAddition);
        document.triggerMutationObserver();
      });

      then("the mjukt element should stay in place", async () => {
        const newPosition = scope.element.getBoundingClientRect();
        assert.deepStrictEqual(newPosition, scope.previousPosition);
      });

      and("the element should move into its final place", async () => {
        await rafUntilStill(scope.element);
        const finalPosition = scope.element.getBoundingClientRect();
        assert.deepStrictEqual(finalPosition.left, 100);
        assert.deepStrictEqual(finalPosition.top, 100);
      });
    }
  );

  scenario(
    "scaling element while scale not completed",
    ({ before, after, given, when, then, and }) => {
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
        scope.element.style.width = scope.element.style.height = 200;
        document.triggerMutationObserver();
      });

      and("a few rAFs happen", async () => {
        dumdom.triggerRAF();
        await sleep(0);
        scope.previousPosition = scope.element.getBoundingClientRect();
      });

      when("element is resized again", async () => {
        scope.element.style.width = scope.element.style.height = 300;
        scope.element.style.transform = "";
        document.triggerMutationObserver();
      });

      then("the mjukt element should stay in place", async () => {
        const newPosition = scope.element.getBoundingClientRect();
        assert.deepStrictEqual(newPosition, scope.previousPosition);
      });

      and("the element should move into its final place", async () => {
        await rafUntilStill(scope.element);
        const finalPosition = scope.element.getBoundingClientRect();
        assert.deepStrictEqual(finalPosition.top, 0);
        assert.deepStrictEqual(finalPosition.left, 0);
        assert.deepStrictEqual(finalPosition.right, 300);
        assert.deepStrictEqual(finalPosition.bottom, 300);
      });
    }
  );

  scenario("back and forth", ({ before, after, given, when, then, and }) => {
    const scope = {};

    before(() => dumdom.init());
    after(() => dumdom.reset());

    given("a mjukt element", () => {
      const div = document.createElement("div");
      div.style.display = "block";
      document.appendChild(div);
      scope.element = div;
      mjukna(div);
    });

    when("a block element is added", () => {
      scope.addition = document.createElement("div");
      scope.addition.style.display = "inline-block";
      document.prepend(scope.addition);
      document.triggerMutationObserver();
    });

    and("a few rAFs happen", async () => {
      dumdom.triggerRAF();
      await sleep(0);
      dumdom.triggerRAF();
      await sleep(0);
      scope.previousPosition = scope.element.getBoundingClientRect();
    });

    when("the block is removed", async () => {
      document.removeChild(scope.addition);
      document.triggerMutationObserver();
    });

    then("the mjukt element should stay in place", async () => {
      const newPosition = scope.element.getBoundingClientRect();
      assert.deepStrictEqual(newPosition.top, scope.previousPosition.top);
    });

    and("the element should move into its original place", async () => {
      await rafUntilStill(scope.element);
      const finalPosition = scope.element.getBoundingClientRect();
      assert.deepStrictEqual(finalPosition.left, 0);
      assert.deepStrictEqual(finalPosition.top, 0);
    });
  });
});
