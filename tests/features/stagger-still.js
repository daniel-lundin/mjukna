/* global mjukna, dumpClientRect, elementStill, byId, waitForRAFs */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");

const { setupNewPage } = require("../helpers/browser.js");

feature("stagger still", scenario => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => {
    return browser.close();
  });

  scenario(
    "staggered elements should stay in place",
    ({ before, given, when, then, and, but }) => {
      let page;
      const scope = {};

      before(async () => {
        page = await setupNewPage(browser);
      });

      given("a nested element", async () => {
        scope.initialPositions = await page.evaluate(() => {
          const outer = document.createElement("div");
          outer.setAttribute("id", "outer");
          document.body.appendChild(outer);
          const inner = document.createElement("div");
          inner.setAttribute("id", "inner");
          inner.style.height = inner.style.width = "50px";
          outer.appendChild(inner);
          document.body.appendChild(outer);
          mjukna([outer, inner], { staggerBy: 500 });
          return [outer, inner].map(dumpClientRect);
        });
      });

      when("the outer element moves and resizes", () => {
        return page.evaluate(() => {
          const outer = byId("outer");
          outer.style.marginLeft = "100px";
          outer.style.width = "200px";
        });
      });

      when("a few rafs pass by", async () => {
        scope.intermediatePositions = await page.evaluate(async () => {
          await waitForRAFs(4);
          return [byId("outer"), byId("inner")].map(dumpClientRect);
        });
      });

      then("the outer element should have started to move", async () => {
        const [initialOuter] = scope.initialPositions;
        const [intermediateOuter] = scope.intermediatePositions;
        assert(initialOuter.width < intermediateOuter.width);
        assert(initialOuter.left < intermediateOuter.left);
      });

      but("the inner should have not", () => {
        const initialInner = scope.initialPositions[1];
        const intermediateInner = scope.intermediatePositions[1];
        assert.deepStrictEqual(initialInner, intermediateInner);
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
