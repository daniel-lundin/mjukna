/* global mjukna, dumpClientRect, elementStill */
// @ts-ignore
import assert from "assert";
import puppeteer from "puppeteer";
import { feature } from "kuta/lib/bdd";

import { setupNewPage } from "../helpers/browser.js";

feature("basics", (scenario) => {
  let browser;

  scenario.before(async () => {
    browser = await puppeteer.launch();
  });

  scenario.after(() => browser.close());

  scenario("adding elements", ({ before, given, when, then, and }) => {
    let page;
    const scope = {};

    before(async () => {
      page = await setupNewPage(browser);
    });

    given("a paragraph element", async () => {
      // @ts-ignore
      scope.initialPosition = await page.evaluate(() => {
        const div = document.createElement("div");
        document.body.appendChild(div);
        // @ts-ignore
        return dumpClientRect(div);
      });
    });

    when("a h1 is prepended", async () => {
      // @ts-ignore
      scope.newPosition = await page.evaluate(() => {
        const div = document.querySelector("div");
        const h1 = document.createElement("h1");
        h1.innerText = "A heading";

        // @ts-ignore
        const animation = mjukna([div]);

        document.body.prepend(h1);

        animation.execute();
        // @ts-ignore
        return dumpClientRect(div);
      });
    });

    then("the paragraph should stay in place", async () => {
      // @ts-ignore
      console.log("new, initial", scope.newPosition, scope.initialPosition);
      // @ts-ignore
      assert.deepStrictEqual(scope.newPosition, scope.initialPosition);
    });

    and("eventually move into it's new position", async () => {
      await page.waitForFunction(() => {
        // @ts-ignore
        return elementStill(document.querySelector("div"));
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
      // @ts-ignore
      scope.initialPositions = await page.evaluate(() => {
        for (let i = 0; i < 3; ++i) {
          const div = document.createElement("div");
          div.style.display = "inline-block";
          document.body.appendChild(div);
        }
        const elements = Array.from(document.querySelectorAll("div"));
        // @ts-ignore
        return elements.map(dumpClientRect);
      });
    });

    when("elements are resized", async () => {
      // @ts-ignore
      scope.newPositions = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("div"));
        // @ts-ignore
        const animation = mjukna(elements);

        elements[0].style.width = "200px";
        elements[1].style.height = "200px";
        elements[2].style.height = "200px";

        animation.execute();

        // @ts-ignore
        return elements.map(dumpClientRect);
      });
    });

    then("elements should stay in place", () => {
      // @ts-ignore
      scope.initialPositions.forEach((position, index) => {
        // @ts-ignore
        assert.deepStrictEqual(position, scope.newPositions[index]);
      });
    });

    and("eventually move into its new places", async () => {
      await page.waitForFunction(() => {
        const elements = Array.from(document.querySelectorAll("div"));
        return elements.reduce(
          // @ts-ignore
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

        return elements.map(dumpClientRect);
      });
    });

    when("the first element is removed", async () => {
      scope.newPositions = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("div"));
        const animation = mjukna(elements);
        document.body.removeChild(elements[0]);
        animation.execute();

        return elements.map(dumpClientRect);
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
