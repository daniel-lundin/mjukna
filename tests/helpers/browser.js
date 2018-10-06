const { getMjuknaCode } = require("./utils.js");

async function injectHelpers(page) {
  await page.evaluate(() => {
    window.dumpClientRect = element => {
      const cr = element.getBoundingClientRect();
      return {
        top: cr.top,
        left: cr.left,
        bottom: cr.bottom,
        right: cr.right,
        width: cr.width,
        height: cr.height
      };
    };

    window.elementStill = function(element) {
      return element.style.transform === "";
    };

    window.waitForRAFs = function(times) {
      if (times === 0) return Promise.resolve();
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          window.waitForRAFs(times - 1).then(() => {
            resolve();
          });
        });
      });
    };

    window.byId = id => document.getElementById(id);
  });

  const css = `
p,div {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  background: green;
}
div > div {
  background: tomato;
}
* {
  margin: 0;
  padding: 0;
}
`;

  page.addStyleTag({ content: css });
}

async function setupNewPage(browser) {
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.text())); // eslint-disable-line

  const mjuknaCode = await getMjuknaCode();
  await page.evaluate(mjuknaCode);
  await injectHelpers(page);
  return page;
}

module.exports = {
  setupNewPage
};
