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

  scenario("adding", ({ before, given, when, then, but }) => {
    let page;
    const scope = {};

    before(async () => {
      page = await setupNewPage(browser);
    });

    given("one div with enterAnimation and one without are added", async () => {
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
          requestAnimationFrame(() => resolve(elements.map(dumpClientRect)));
        });
      });
    });

    when("a few rafs pass by", async () => {
      scope.intermediatePositions = await page.evaluate(async () => {
        await waitForRAFs(4);
        const elements = [...document.querySelectorAll("div")];
        return elements.map(dumpClientRect);
      });
    });

    then("the first should have moved", () => {
      assert(
        scope.insertPositions[0].width !== scope.intermediatePositions[0].width
      );
    });

    but("the second should have not", () => {
      assert(
        scope.insertPositions[1].width === scope.intermediatePositions[1].width
      );
    });
  });

  scenario("removing items", ({ before, given, when, then, and }) => {
    let page;
    const scope = {};

    before(async () => {
      page = await setupNewPage(browser);
    });

    given("one element that gets removed", async () => {
      scope.insertPosition = await page.evaluate(() => {
        const exitNode = document.createElement("div");
        exitNode.className = "leave";
        document.body.appendChild(exitNode);
        return dumpClientRect(exitNode);
      });
    });

    when("the element is removed", async () => {
      scope.removePosition = await page.evaluate(() => {
        const exitNode = document.querySelector(".leave");
        window.leaveAnimation = mjukna(exitNode);
        exitNode.remove();

        return new Promise(resolve => {
          requestAnimationFrame(() => resolve(dumpClientRect(exitNode)));
        });
      });
    });

    then("the element should stay in place", () => {
      assert.equal(scope.insertPosition.top, scope.removePosition.top);
      assert.equal(scope.insertPosition.left, scope.removePosition.left);
    });

    when("a few rafs pass by", async () => {
      scope.intermediatePosition = await page.evaluate(async () => {
        await waitForRAFs(4);
        return dumpClientRect(document.querySelector(".leave"));
      });
    });

    then("the element should be smaller", () => {
      assert(scope.intermediatePosition.width < scope.insertPosition.width);
    });

    and("eventually be removed", async () => {
      const elementCount = await page.evaluate(async () => {
        await window.leaveAnimation;
        return document.querySelectorAll(".leave").length;
      });
      assert(elementCount === 0);
    });
  });
});
