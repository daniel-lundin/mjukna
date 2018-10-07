/* global mjukna, dumpClientRect, elementStill, byId, waitForRAFs */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");
const { test } = require("kuta");

const { setupNewPage } = require("../helpers/browser.js");
let browser;

test.before(async () => {
  browser = await puppeteer.launch();
});

test.after(() => {
  return browser.close();
});

test("staggered elements should stay in place", async () => {
  const page = await setupNewPage(browser);
  const { initialPositions, intermediatePositions } = await page.evaluate(
    async () => {
      // Setup
      const outer = document.createElement("div");
      const inner = document.createElement("div");
      const elements = [outer, inner];
      outer.setAttribute("id", "outer");
      document.body.appendChild(outer);
      inner.setAttribute("id", "inner");
      inner.style.height = inner.style.width = "50px";
      outer.appendChild(inner);
      document.body.appendChild(outer);

      const initialPositions = elements.map(dumpClientRect);
      mjukna(elements, { staggerBy: 500 });

      // Move outer element
      outer.style.marginLeft = "100px";

      await waitForRAFs(4);
      const intermediatePositions = elements.map(dumpClientRect);

      return { initialPositions, intermediatePositions };
    }
  );

  // Only outer should have started to move
  console.log("initialPositions[0]", initialPositions[0]);
  console.log("intermediatePositions[0]", intermediatePositions[0]);
  assert(initialPositions[0].left < intermediatePositions[0].left);
  assert.equal(initialPositions[1].left, intermediatePositions[1].left);
  // inner
});

// feature("stagger still", scenario => {
//   scenario(
//     "staggered elements should stay in place",
//     ({ before, given, when, then, and, but }) => {
//       let page;
//       const scope = {};
//
//       before(async () => {
//         page = await setupNewPage(browser);
//       });
//
//       given("a nested element", async () => {
//         scope.initialPositions = await page.evaluate(() => {
//           const outer = document.createElement("div");
//           outer.setAttribute("id", "outer");
//           document.body.appendChild(outer);
//           const inner = document.createElement("div");
//           inner.setAttribute("id", "inner");
//           inner.style.height = inner.style.width = "50px";
//           outer.appendChild(inner);
//           document.body.appendChild(outer);
//           mjukna([outer, inner], { staggerBy: 500 });
//           return [outer, inner].map(dumpClientRect);
//         });
//       });
//
//       when("the outer element moves", () => {
//         return page.evaluate(() => {
//           const outer = byId("outer");
//           outer.style.marginLeft = "100px";
//         });
//       });
//
//       when("a few rafs pass by", async () => {
//         scope.intermediatePositions = await page.evaluate(async () => {
//           await waitForRAFs(4);
//           return [byId("outer"), byId("inner")].map(dumpClientRect);
//         });
//       });
//
//       then("the outer element should have started to move", async () => {
//         const [initialOuter] = scope.initialPositions;
//         const [intermediateOuter] = scope.intermediatePositions;
//         // assert(initialOuter.width < intermediateOuter.width);
//         assert(initialOuter.left < intermediateOuter.left);
//       });
//
//       but("the inner should have not", () => {
//         const initialInner = scope.initialPositions[1];
//         const intermediateInner = scope.intermediatePositions[1];
//         assert.deepStrictEqual(initialInner, intermediateInner);
//       });
//
//       when("the elements are still", () => {});
//     }
//   );
// });
