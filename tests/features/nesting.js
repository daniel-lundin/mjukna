/* global mjukna, dumpClientRect, waitForRAFs */
const assert = require("assert");
const puppeteer = require("puppeteer");
const { test } = require("kuta");

const { setupNewPage } = require("../helpers/browser.js");

let browser;

test.before(async () => {
  browser = await puppeteer.launch({ headless: false });
});

test.after(() => browser.close());

test("moving and resizing nested elements", async () => {
  const page = await setupNewPage(browser);

  const {
    initialPositions,
    invertedPositions,
    intermediatePositions
  } = await page.evaluate(async () => {
    // Setup nested divs
    const outer = document.createElement("div");
    const inner = document.createElement("div");
    const elements = [outer, inner];
    document.body.appendChild(outer);
    outer.appendChild(inner);
    outer.style.marginLeft = "200px";
    inner.style.height = "50px";
    const initialPositions = elements.map(dumpClientRect);
    mjukna(elements);

    // Resize/move
    outer.style.marginLeft = "0px";
    outer.style.height = "200px";
    inner.style.height = "100px";

    // Record inverted positions
    const invertedPositions = await new Promise(resolve => {
      requestAnimationFrame(() => resolve(elements.map(dumpClientRect)));
    });

    // Record intermediate positions
    await waitForRAFs(4);
    const intermediatePositions = elements.map(dumpClientRect);
    return { initialPositions, invertedPositions, intermediatePositions };
  });

  // Assert inverted positions
  assert.deepStrictEqual(initialPositions[0], invertedPositions[0]);
  assert.deepStrictEqual(initialPositions[1], invertedPositions[1]);

  // Outer should have started to move and grow
  assert(intermediatePositions[0].left < initialPositions[0].left);
  assert(intermediatePositions[0].height > initialPositions[0].height);

  // Inner should move and grow
  assert(intermediatePositions[1].left < initialPositions[1].left);
  assert(intermediatePositions[1].height > initialPositions[1].height);
});
