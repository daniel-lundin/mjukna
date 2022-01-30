// @ts-ignore
import assert from "assert";
import puppeteer from "puppeteer";
import { feature } from "kuta/lib/bdd";

import { setupNewPage } from "../helpers/browser.js";

feature("enter/exit", (scenario) => {
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
      // @ts-ignore
      scope.insertPositions = await page.evaluate(() => {
        // @ts-ignore
        const animation = mjukna([
          {
            getElement: () => document.querySelector(".enter"),
          },
        ]);
        const animatable = document.createElement("div");
        animatable.className = "enter";
        const unanimatable = document.createElement("div");
        document.body.appendChild(animatable);
        document.body.appendChild(unanimatable);
        const elements = [animatable, unanimatable];
        animation.execute();

        // @ts-ignore
        return elements.map(dumpClientRect);
      });
    });

    when("a few rafs pass by", async () => {
      // @ts-ignore
      scope.intermediatePositions = await page.evaluate(async () => {
        // @ts-ignore
        await waitForRAFs(4);
        const elements = [...document.querySelectorAll("div")];
        // @ts-ignore
        return elements.map(dumpClientRect);
      });
    });

    then("the first should have moved", () => {
      assert(
        // @ts-ignore
        scope.insertPositions[0].width !== scope.intermediatePositions[0].width
      );
    });

    but("the second should have not", () => {
      assert(
        // @ts-ignore
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
      // @ts-ignore
      scope.insertPosition = await page.evaluate(() => {
        const exitNode = document.createElement("div");
        exitNode.className = "leave";
        document.body.appendChild(exitNode);
        return dumpClientRect(exitNode);
      });

      scope.removePosition = await page.evaluate(() => {
        const exitNode = document.querySelectorAll(".leave");
        const animation = mjukna(exitNode);
        exitNode[0].remove();
        // @ts-ignore
        window.leaveAnimation = animation.execute();

        // @ts-ignore
        return dumpClientRect(exitNode[0]);
      });
    });

    then("the element should stay in place", () => {
      // @ts-ignore
      assert.equal(scope.insertPosition.top, scope.removePosition.top);
      // @ts-ignore
      assert.equal(scope.insertPosition.left, scope.removePosition.left);
    });

    when("a few rafs pass by", async () => {
      // @ts-ignore
      scope.intermediatePosition = await page.evaluate(async () => {
        // @ts-ignore
        await waitForRAFs(4);
        // @ts-ignore
        return dumpClientRect(document.querySelector(".leave"));
      });
    });

    then("the element should be smaller", () => {
      // @ts-ignore
      assert(scope.intermediatePosition.width < scope.insertPosition.width);
    });

    and("eventually be removed", async () => {
      const elementCount = await page.evaluate(async () => {
        // @ts-ignore
        await window.leaveAnimation;
        return document.querySelectorAll(".leave").length;
      });
      assert(elementCount === 0);
    });
  });
});
