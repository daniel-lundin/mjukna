/* global waitForRAFs, byId, dumpClientRect, elementStill */

const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");
const { mjukna } = require("../../index.js");
const { assertEqualPositions } = require("../helpers/utils");

const { setupNewPage } = require("../helpers/browser.js");

feature.only("interruptions", scenario => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch({ headless: false });
  });

  scenario.after(() => browser.close());

  scenario(
    "mutations while animations in progess",
    ({ before, given, when, then, and }) => {
      const scope = {};
      let page;

      before(async () => {
        page = await setupNewPage(browser);
      });

      given("a mjukt inline-block element", async () => {
        scope.initialPosition = await page.evaluate(() => {
          const div = document.createElement("div");
          div.style.width = "50px";
          div.style.height = "50px";
          div.setAttribute("id", "initial-element");
          div.style.display = "inline-block";
          document.body.appendChild(div);
          mjukna(div);
          return dumpClientRect(div);
        });
      });

      when("an inline-block element is added", () => {
        return page.evaluate(() => {
          const div = document.createElement("div");
          div.style.width = "50px";
          div.style.height = "50px";
          div.setAttribute("id", "added-element");
          div.style.display = "inline-block";
          document.body.prepend(div);
        });
      });

      and("a few rAFs happen", async () => {
        scope.intermediatePosition = await page.evaluate(async () => {
          await waitForRAFs(3);
          return dumpClientRect(byId("initial-element"));
        });
      });

      when("the added element is removed", async () => {
        return page.evaluate(() => {
          const initalElement = byId("initial-element");
          const added = byId("added-element");
          mjukna(initalElement);
          document.body.removeChild(added);
        });
      });

      then("the mjukt element should stay in place", async () => {
        const newPosition = await page.evaluate(() => {
          const initalElement = byId("initial-element");
          return dumpClientRect(initalElement);
        });
        assertEqualPositions(newPosition, scope.intermediatePosition);
      });

      and("the element should move into its final place", async () => {
        await page.waitForFunction(() => {
          return elementStill(byId("initial-element"));
        });

        const finalPosition = await page.evaluate(() => {
          return dumpClientRect(byId("initial-element"));
        });
        assert.deepStrictEqual(finalPosition, scope.initialPosition);
      });
    }
  );

  scenario(
    "scaling element while scale not completed",
    ({ before, given, when, then, and }) => {
      const scope = {};
      let page;

      before(async () => {
        page = await setupNewPage(browser);
      });

      given("a mjukt element", async () => {
        scope.initialPosition = await page.evaluate(() => {
          const div = document.createElement("div");
          div.setAttribute("id", "element");
          div.style.width = "100px";
          div.style.height = "100px";
          document.body.appendChild(div);
          mjukna(div);
          return dumpClientRect(div);
        });
      });

      when("when element is resized", () => {
        return page.evaluate(() => {
          const div = byId("element");
          div.style.width = "100px";
          div.style.height = "100px";
        });
      });

      and("a few rAFs happen", async () => {
        scope.intermediatePosition = await page.evaluate(async () => {
          await waitForRAFs(3);
          return dumpClientRect(byId("element"));
        });
      });

      when("when element is resized again", () => {
        return page.evaluate(() => {
          const div = byId("element");
          mjukna(div);
          div.style.width = "100px";
          div.style.height = "100px";
        });
      });

      then("the mjukt element should stay in place", async () => {
        const newPosition = await page.evaluate(() => {
          const initalElement = byId("element");
          return dumpClientRect(initalElement);
        });
        assertEqualPositions(newPosition, scope.intermediatePosition);
      });

      and("the element should move into its final place", async () => {
        await page.waitForFunction(() => {
          return elementStill(byId("element"));
        });

        const finalPosition = await page.evaluate(() => {
          return dumpClientRect(byId("element"));
        });
        assert.deepStrictEqual(finalPosition, scope.initialPosition);
      });
    }
  );
});
