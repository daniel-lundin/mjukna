/* global mjukna, dumpClientRect, elementStill */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { feature } = require("kuta/lib/bdd");

const { setupNewPage } = require("../helpers/browser.js");

feature("basics", scenario => {
  let browser;

  scenario.before(async () => {
    try {
      browser = await puppeteer.launch({ headless: false });
    } catch (err) {
      console.log("puppeteer launch error", err);
      throw err;
    }
  });

  scenario.after(() => browser.close());

  scenario("adding elements", ({ before, given, when, then, and }) => {
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

  scenario("resizing elements", ({ before, given, when, then, and }) => {
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

    and("eventually move into its new places", async () => {
      await page.waitForFunction(() => {
        const elements = Array.from(document.querySelectorAll("div"));
        return elements.reduce(
          (still, element) => still && elementStill(element),
          true
        );
      });
    });
  });

  scenario("removing elements", ({ before, given, when, then, and }) => {
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

    when("the first element is removed", async () => {
      scope.newPositions = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("div"));
        document.body.removeChild(elements[0]);

        return new Promise(resolve =>
          requestAnimationFrame(() => {
            resolve(elements.map(dumpClientRect));
          })
        );
      });
    });

    then("elements should stay in place", () => {
      scope.initialPositions.slice(1).forEach((position, index) => {
        assert.deepStrictEqual(position, scope.newPositions.slice(1)[index]);
      });
    });

    and("eventually move into its new places", async () => {
      await page.waitForFunction(() => {
        const elements = Array.from(document.querySelectorAll("div"));
        return elements.reduce(
          (still, element) => still && elementStill(element),
          true
        );
      });
    });
  });
});
