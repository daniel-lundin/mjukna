/* global mjukna, dumpClientRect, elementStill */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");

const { setupNewPage } = require("../helpers/browser.js");

feature("reordering", scenario => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => browser.close());

  scenario("swap elements", ({ before, given, when, then, but }) => {
    let page;
    const scope = {};

    before(async () => {
      page = await setupNewPage(browser);
    });

    given("two elements", async () => {
      scope.initialPositions = await page.evaluate(() => {
        const upper = document.createElement("div");
        const lower = document.createElement("div");
        upper.classList.add("upper");
        lower.classList.add("lower");
        document.body.appendChild(upper);
        document.body.appendChild(lower);
        return [upper, lower].map(dumpClientRect);
      });
    });

    when("the elements are swapped", async () => {
      scope.intermediatePositions = await page.evaluate(() => {
        const [upper, lower] = document.querySelectorAll(".upper, .lower");
        mjukna([upper, lower]);
        lower.remove();
        document.body.prepend(lower);

        return new Promise(resolve => {
          requestAnimationFrame(() =>
            resolve([upper, lower].map(dumpClientRect))
          );
        });
      });
    });

    then("both elements should stay in place", () => {
      scope.initialPositions.forEach((position, index) => {
        const newPosition = scope.intermediatePositions[index];
        assert.deepStrictEqual(position, newPosition);
      });
    });

    when("elements have stopped moving", async () => {
      await page.waitForFunction(() => {
        return elementStill(document.querySelector(".upper"));
      });
    });

    then("lower should be above upper", async () => {
      const finalPositions = await page.evaluate(async () => {
        const upper = document.querySelector(".upper");
        const lower = document.querySelector(".lower");
        return [upper, lower].map(dumpClientRect);
      });

      assert.deepStrictEqual(finalPositions[0], scope.initialPositions[1]);
      assert.deepStrictEqual(finalPositions[1], scope.initialPositions[0]);
    });
  });
});
