/* global mjukna, dumpClientRect, elementStill */
import assert from "assert";
import puppeteer from "puppeteer";
import { feature } from "kuta/lib/bdd";

import { setupNewPage } from "../helpers/browser.js";

feature("reordering", (scenario) => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => browser.close());

  scenario("swap elements", ({ before, given, when, then }) => {
    let page;
    const scope: {
      initialPositions?: any;
      intermediatePositions?: any;
    } = {};
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
        // @ts-ignore error
        return [upper, lower].map(dumpClientRect);
      });
    });

    when("the elements are swapped", async () => {
      scope.intermediatePositions = await page.evaluate(() => {
        const [upper, lower] = document.querySelectorAll(".upper, .lower");
        // @ts-ignore error
        animation = mjukna([{ element: upper }, { element: lower }]);
        lower.remove();
        document.body.prepend(lower);
        // @ts-ignore error
        animation.execute();
        // @ts-ignore error
        return [upper, lower].map(dumpClientRect);
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
        // @ts-ignore error
        return elementStill(document.querySelector(".upper"));
      });
    });

    then("lower should be above upper", async () => {
      const finalPositions = await page.evaluate(async () => {
        const upper = document.querySelector(".upper");
        const lower = document.querySelector(".lower");
        // @ts-ignore error
        return [upper, lower].map(dumpClientRect);
      });

      assert.deepStrictEqual(finalPositions[0], scope.initialPositions[1]);
      assert.deepStrictEqual(finalPositions[1], scope.initialPositions[0]);
    });
  });
});
