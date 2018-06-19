/* global mjukna, dumpClientRect, waitForRAFs */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");

const { setupNewPage } = require("../helpers/browser.js");

feature("enter/exit", scenario => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => browser.close());

  scenario(
    "adding and removing items",
    ({ before, given, when, then, but }) => {
      let page;
      const scope = {};

      before(async () => {
        page = await setupNewPage(browser);
      });

      given(
        "one div with enterAnimation and one without are added",
        async () => {
          scope.insertPositions = await page.evaluate(() => {
            mjukna([], {
              enterFilter: element => element.className === "enter"
            });
            const animatable = document.createElement("div");
            animatable.className = "enter";
            const unanimatable = document.createElement("div");
            document.body.appendChild(animatable);
            document.body.appendChild(unanimatable);
            const elements = [animatable, unanimatable];

            return new Promise(resolve => {
              requestAnimationFrame(() =>
                resolve(elements.map(dumpClientRect))
              );
            });
          });
        }
      );

      when("a few rafs pass by", async () => {
        scope.intermediatePositions = await page.evaluate(async () => {
          await waitForRAFs(4);
          const elements = [...document.querySelectorAll("div")];
          return elements.map(dumpClientRect);
        });
      });

      then("the first should have moved", () => {
        assert(
          scope.insertPositions[0].width !==
            scope.intermediatePositions[0].width
        );
      });

      but("the second should have not", () => {
        assert(
          scope.insertPositions[1].width ===
            scope.intermediatePositions[1].width
        );
      });
    }
  );
});
