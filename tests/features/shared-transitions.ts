/* global mjukna, dumpClientRect, elementStill, byId */
import assert from "assert";
import puppeteer from "puppeteer";
import { feature } from "kuta/lib/bdd";

import { setupNewPage } from "../helpers/browser.js";

feature("shared transitions", (scenario) => {
  let browser: { close: () => any };

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => {
    return browser.close();
  });

  scenario(
    "using other element as origin",
    ({ before, given, when, then, and }) => {
      let page: {
        evaluate: (arg0: { (): Promise<any>; (): any }) => any;
        waitForFunction: (arg0: () => any) => any;
      };
      const scope: {
        initialPosition?: any;
        addPosition?: any;
      } = {};

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
          // @ts-ignore error
          mjukna(div);
          // @ts-ignore error
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

          // @ts-ignore
          const animation = mjukna([
            {
              // @ts-ignore
              anchor: byId("anchor-element"),
              getElement: () => div,
            },
          ]);
          document.body.appendChild(div);
          animation.execute();

          // @ts-ignore
          return dumpClientRect(div);
        });
      });

      then("the element should be placed at the origin element", async () => {
        assert.deepStrictEqual(scope.initialPosition, scope.addPosition);
      });

      and("eventually move into it's new position", async () => {
        await page.waitForFunction(() => {
          // @ts-ignore
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
