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

  // scenario(
  //   "using other element as exit point",
  //   ({ before, given, when, then, and }) => {
  //     let page;
  //     const scope = {};

  //     before(async () => {
  //       page = await setupNewPage(browser);
  //     });

  //     given("two elements", async () => {
  //       const initialPositions = await page.evaluate(() => {
  //         const target = document.createElement("div");
  //         target.setAttribute("id", "target");
  //         target.style.display = "inline-block";
  //         target.style.height = "100px";
  //         target.style.width = "100px";
  //         target.style.background = "red";
  //         const element = document.createElement("div");
  //         element.setAttribute("id", "element");
  //         element.style.display = "inline-block";
  //         element.style.height = "200px";
  //         element.style.width = "200px";
  //         element.style.background = "green";
  //         document.body.appendChild(target);
  //         document.body.appendChild(element);
  //         return [dumpClientRect(element), dumpClientRect(target)];
  //       });
  //       scope.initialElementPosition = initialPositions[0];
  //       scope.initialTargetPosition = initialPositions[1];
  //     });

  //     when("the element is removed", async () => {
  //       scope.removePosition = await page.evaluate(() => {
  //         const element = byId("element");
  //         mjukna([{ element, target: byId("target") }]);
  //         element.parentNode.removeChild(element);

  //         return new Promise(resolve => {
  //           requestAnimationFrame(() => resolve(dumpClientRect(element)));
  //         });
  //       });
  //     });

  //     then("the element should stay in place", async () => {
  //       assert.deepStrictEqual(
  //         scope.initialElementPosition,
  //         scope.removePosition
  //       );
  //     });

  //     when("a few rafs pass by", async () => {
  //       scope.intermediatePosition = await page.evaluate(async () => {
  //         await waitForRAFs(4);
  //         return dumpClientRect(byId("element"));
  //       });
  //     });

  //     then("the element should move towards the target", () => {
  //       const currentLeft = scope.intermediatePosition.left;
  //       assert(currentLeft < scope.removePosition.left);
  //     });

  //     and("eventually disappear", async () => {
  //       await page.waitFor(() => !byId("element"));
  //     });
  //   }
  // );
});
