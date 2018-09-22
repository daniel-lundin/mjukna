/* global mjukna, dumpClientRect, elementStill, byId */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");

const { setupNewPage } = require("../helpers/browser.js");

feature("shared transitions", scenario => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => {
    return browser.close();
  });

  scenario(
    "using other element as origin",
    ({ before, given, when, then, and }) => {
      let page;
      const scope = {};

      before(async () => {
        page = await setupNewPage(browser);
      });

      given("an element", async () => {
        scope.initialPosition = await page.evaluate(() => {
          const div = document.createElement("div");
          div.setAttribute("id", "anchor-element");
          div.style.height = "100px";
          div.style.width = "100px";
          div.style.background = "red";
          document.body.appendChild(div);
          mjukna(div);
          return Promise.resolve(dumpClientRect(div));
        });
      });

      when("a bottom-right positioned fixed element is added", async () => {
        scope.addPosition = await page.evaluate(() => {
          const div = document.createElement("div");
          div.setAttribute("id", "added-element");
          div.style.background = "green";
          div.style.position = "fixed";
          div.style.bottom = "0";
          div.style.right = "0";
          div.style.height = "200px";
          div.style.width = "200px";
          mjukna({
            anchor: byId("anchor-element"),
            element: () => div
          });
          document.body.appendChild(div);

          return new Promise(resolve => {
            requestAnimationFrame(() => resolve(dumpClientRect(div)));
          });
        });
      });

      then("the element should be placed at the origin element", async () => {
        assert.deepStrictEqual(scope.initialPosition, scope.addPosition);
      });

      and("eventually move into it's new position", async () => {
        await page.waitForFunction(() => {
          return elementStill(byId("added-element"));
        });
      });
    }
  );
});
