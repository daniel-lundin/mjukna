/* global mjukna, dumpClientRect, elementStill */
const assert = require("assert");
const path = require("path");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");
const rollup = require("rollup");
const rollupConfig = require(path.join(__dirname, "../../rollup.config.js"))
  .default;

async function build() {
  const bundle = await rollup.rollup(rollupConfig);
  const { code } = await bundle.generate(rollupConfig);
  return code;
}

async function injectHelpers(page) {
  await page.evaluate(() => {
    window.dumpClientRect = element => {
      const cr = element.getBoundingClientRect();
      return {
        top: cr.top,
        left: cr.left,
        bottom: cr.bottom,
        right: cr.right
      };
    };

    window.elementStill = function(element) {
      return element.style.transform === "";
    };
  });
}

async function setupNewPage(browser) {
  const page = await browser.newPage();
  const mjuknaCode = await build();
  await page.evaluate(mjuknaCode);
  await injectHelpers(page);
  return page;
}
feature.only("basics", scenario => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch({ headless: false });
  });

  scenario("adding elements", ({ before, after, given, when, then, and }) => {
    let page;
    const scope = {};

    before(async () => {
      page = await setupNewPage(browser);
    });

    given("a paragraph element", async () => {
      scope.initialPosition = await page.evaluate(() => {
        const p = document.createElement("p");
        p.style.height = "100px";
        p.style.background = "red";
        document.body.appendChild(p);
        mjukna([p]);
        return Promise.resolve(dumpClientRect(p));
      });
    });

    when("a h1 is prepended", async () => {
      scope.newPosition = await page.evaluate(() => {
        const h1 = document.createElement("h1");
        h1.innerText = "A heading";
        document.body.prepend(h1);
        const p = document.querySelector("p");

        return new Promise(resolve => {
          requestAnimationFrame(() => resolve(dumpClientRect(p)));
        });
      });
    });

    then("the paragraph should stay in place", async () => {
      assert.deepStrictEqual(scope.newPosition, scope.initialPosition);
    });

    and("eventually move into it's new position", async () => {
      await page.waitForFunction(() => {
        return elementStill(document.querySelector("p"));
      });
    });
  });

  scenario("resizing elements", ({ before, after, given, when, then, and }) => {
    const scope = {};
    let page;

    before(async () => {
      page = await setupNewPage(browser);
    });

    given("three mjukt elements", async () => {
      scope.initialPositions = await page.evaluate(() => {
        for (let i = 0; i < 3; ++i) {
          const div = document.createElement("div");
          div.style.display = "inline-block";
          div.style.width = "100px";
          div.style.height = "100px";
          div.style.background = "red";
          document.body.appendChild(div);
        }
        const elements = Array.from(document.querySelectorAll("div"));
        mjukna(elements);

        return Promise.resolve(elements.map(dumpClientRect));
      });
    });

    when("elements are resized", async () => {
      scope.newPositions = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("div"));
        elements[0].style.width = 200;
        elements[1].style.height = 200;
        elements[2].style.height = 200;

        return new Promise(resolve =>
          requestAnimationFrame(() => {
            resolve(elements.map(dumpClientRect));
          })
        );
      });
    });

    then("elements should stay in place", () => {
      scope.initialPositions.forEach((position, index) => {
        assert.deepStrictEqual(position, scope.newPositions[index]);
      });
    });

    // and("eventually move into its new places", async () => {
    //   await rafUntilStill(elements[0]);
    //   const expectedPositions = [
    //     { top: 0, right: 200, bottom: 100 },
    //     { top: 0, left: 200, bottom: 200 },
    //     { top: 200, bottom: 400, left: 0, right: 100 }
    //   ];

    //   expectedPositions.forEach((expectedPosition, index) => {
    //     const newPosition = elements[index].getBoundingClientRect();
    //     Object.keys(expectedPosition).forEach(key => {
    //       assert.deepStrictEqual(newPosition[key], expectedPosition[key]);
    //     });
    //   });
    // });
  });
});

// const assert = require("assert");
// const { feature } = require("kuta/lib/bdd");
// const dumdom = require("../helpers/dumdom");
// const { mjukna } = require("../../index.js");
// const { repeat } = require("../helpers/utils");
// const { rafUntilStill } = require("../helpers/wait");

// feature.only("basics", scenario => {
// scenario("resizing elements", ({ before, after, given, when, then, and }) => {
//   const elements = [];
//   const startPositions = [];

//   before(() => dumdom.init());
//   after(() => dumdom.reset());

//   given("three mjukt elements", () => {
//     repeat(2)(() => {
//       const div = document.createElement("div");
//       div.style.display = "inline-block";
//       document.appendChild(div);
//       elements.push(div);
//       startPositions.push(div.getBoundingClientRect());
//       mjukna(div, { scale: true });
//     });

//     const div = document.createElement("div");
//     document.appendChild(div);
//     mjukna(div, { scale: true });
//     elements.push(div);
//     startPositions.push(div.getBoundingClientRect());
//   });

//   when("elements are resized", () => {
//     elements[0].style.width = 200;
//     elements[1].style.height = 200;
//     elements[2].style.height = 200;
//     document.triggerMutationObserver();
//   });

//   then("elements should stay in place", () => {
//     elements.forEach((element, index) => {
//       assert.deepStrictEqual(
//         element.getBoundingClientRect(),
//         startPositions[index]
//       );
//     });
//   });

//   and("eventually move into its new places", async () => {
//     await rafUntilStill(elements[0]);
//     const expectedPositions = [
//       { top: 0, right: 200, bottom: 100 },
//       { top: 0, left: 200, bottom: 200 },
//       { top: 200, bottom: 400, left: 0, right: 100 }
//     ];

//     expectedPositions.forEach((expectedPosition, index) => {
//       const newPosition = elements[index].getBoundingClientRect();
//       Object.keys(expectedPosition).forEach(key => {
//         assert.deepStrictEqual(newPosition[key], expectedPosition[key]);
//       });
//     });
//   });
// });

// scenario("removing elements", ({ before, after, given, when, then, and }) => {
//   const scope = {};

//   before(() => {
//     dumdom.init();
//   });

//   after(() => {
//     dumdom.reset();
//   });

//   given("an element and a mjukt element", () => {
//     scope.firstElement = document.createElement("div");
//     document.appendChild(scope.firstElement);
//     const div = document.createElement("div");
//     document.appendChild(div);
//     scope.element = div;
//     scope.previousPosition = div.getBoundingClientRect();
//   });

//   when("an element is removed", () => {
//     mjukna(scope.element);
//     document.removeChild(scope.firstElement);
//     document.triggerMutationObserver();
//   });

//   then("element should be in the same place", () => {
//     const position = scope.element.getBoundingClientRect();
//     assert.deepStrictEqual(scope.previousPosition, position);
//   });

//   and("eventually move in to its new place", async () => {
//     await rafUntilStill(scope.element);
//     const newPosition = scope.element.getBoundingClientRect();
//     const expected = {
//       top: 0,
//       bottom: 100
//     };
//     assert.deepStrictEqual(newPosition.top, expected.top);
//     assert.deepStrictEqual(newPosition.bottom, expected.bottom);
//   });
// });
//});
