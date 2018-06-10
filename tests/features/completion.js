/* global mjukna, dumpClientRect, waitForRAFs */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");

const { setupNewPage } = require("../helpers/browser.js");

feature.only("completion", scenario => {
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
        scope.initialPositions = await page.evaluate(() => {
          const first = document.createElement("div");
          first.style.height = "100px";
          document.body.appendChild(first);
          const second = document.createElement("div");
          second.style.height = "100px";
          document.body.appendChild(second);

          window.animationPromise = mjukna([first, second]);
          return [first, second].map(dumpClientRect);
        });
      });

      when("a new element is added", async () => {
        scope.newPositions = await page.evaluate(() => {
          const p = document.createElement("p");
          p.style.height = "100px";
          document.body.prepend(p);

          return new Promise(resolve => {
            requestAnimationFrame(() => {
              const divs = Array.from(document.querySelectorAll("div"));
              resolve(divs.map(dumpClientRect));
            });
          });
        });
      });

      then("the elements should stay in place", () => {
        scope.initialPositions.forEach((position, index) => {
          assert.deepStrictEqual(position, scope.newPositions[index]);
        });
      });

      when("a few rAFs happen", async () => {
        scope.intermediatePosition = await page.evaluate(async () => {
          await waitForRAFs(5);
        });
      });

      when("the promise resolves", () => {
        return page.evaluate(async () => {
          await window.animationPromise;
        });
      });

      then("the elements should be in their final position", async () => {
        const finalTransforms = await page.evaluate(() => {
          const divs = Array.from(document.querySelectorAll("div"));
          return divs.map(element => element.style.transform);
        });
        finalTransforms.forEach(transform => assert.equal(transform, ""));
      });
    }
  );
});
