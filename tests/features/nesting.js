/* global mjukna, dumpClientRect, elementStill, waitForRAFs */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");

const { setupNewPage } = require("../helpers/browser.js");

feature("basics", scenario => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => browser.close());

  scenario("resizing container", ({ before, given, when, then, and, but }) => {
    let page;
    const scope = {};

    before(async () => {
      page = await setupNewPage(browser);
    });

    given("a div with a div", async () => {
      scope.initialPositions = await page.evaluate(() => {
        const outer = document.createElement("div");
        outer.style.height = "100px";
        outer.style.width = "100px";
        const inner = document.createElement("div");
        inner.style.height = "50px";
        inner.style.width = "50px";
        document.body.appendChild(outer);
        outer.appendChild(inner);
        mjukna([outer, inner]);
        return Promise.resolve([outer, inner].map(dumpClientRect));
      });
    });

    when("outer div is doubled in size", async () => {
      scope.newPositions = await page.evaluate(() => {
        const outer = document.querySelector("div");
        outer.style.width = "200px";
        const elements = [...document.querySelectorAll("div")];

        return new Promise(resolve => {
          requestAnimationFrame(() => resolve(elements.map(dumpClientRect)));
        });
      });
    });

    then("both elements should stay in place", () => {
      scope.initialPositions.forEach((position, index) => {
        const newPosition = scope.newPositions[index];
        assert.deepStrictEqual(position, newPosition);
      });
    });

    when("a few rafs pass by", async () => {
      scope.intermediatePositions = await page.evaluate(async () => {
        await waitForRAFs(4);
        const elements = [...document.querySelectorAll("div")];
        return elements.map(dumpClientRect);
      });
    });

    then("outer should have started resize", async () => {
      assert(
        scope.intermediatePositions[0].width > scope.initialPositions[0].width
      );
    });

    but("the inner should stay place", () => {
      assert(
        Math.abs(
          scope.intermediatePositions[1].width - scope.initialPositions[1].width
        ) < 0.001
      );
    });
  });
});
