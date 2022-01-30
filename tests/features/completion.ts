// @ts-ignore
import assert from "assert";
import puppeteer from "puppeteer";
import { feature } from "kuta/lib/bdd";

import { setupNewPage } from "../helpers/browser.js";

feature("completion", (scenario) => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => browser.close());

  scenario(
    "resolve once all animations are completed",
    ({ before, given, when, then }) => {
      let page;
      const scope = {};

      before(async () => {
        page = await setupNewPage(browser);
      });

      given("two mjukt elements", async () => {
        // @ts-ignore
        scope.initialPositions = await page.evaluate(() => {
          const first = document.createElement("div");
          first.style.height = "100px";
          document.body.appendChild(first);
          const second = document.createElement("div");
          second.style.height = "100px";
          document.body.appendChild(second);

          // @ts-ignore
          return [first, second].map(dumpClientRect);
        });
      });

      when("a new element is added", async () => {
        // @ts-ignore
        scope.newPositions = await page.evaluate(() => {
          const divs = document.querySelectorAll("div");
          const animation = mjukna(divs);
          const p = document.createElement("p");
          p.style.height = "100px";
          document.body.prepend(p);

          // @ts-ignore
          window.animationPromise = animation.execute();

          const divArray = Array.from(document.querySelectorAll("div"));
          // @ts-ignore
          return divArray.map(dumpClientRect);
        });
      });

      then("the elements should stay in place", () => {
        // @ts-ignore
        scope.initialPositions.forEach((position, index) => {
          assert.deepStrictEqual(position, scope.newPositions[index]);
        });
      });

      when("a few rAFs happen", async () => {
        // @ts-ignore
        scope.intermediatePosition = await page.evaluate(async () => {
          // @ts-ignore
          await waitForRAFs(5);
        });
      });

      when("the promise resolves", () => {
        return page.evaluate(async () => {
          // @ts-ignore
          await window.animationPromise;
        });
      });

      then("the elements should be in their final position", async () => {
        const finalTransforms = await page.evaluate(() => {
          const divs = Array.from(document.querySelectorAll("div"));
          return divs.map((element) => element.style.transform);
        });
        finalTransforms.forEach((transform) => assert.equal(transform, ""));
      });
    }
  );
});
