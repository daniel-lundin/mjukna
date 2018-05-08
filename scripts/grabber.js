const fs = require("fs");
const { mjukna } = require("../index.js");
const dumdom = require("../tests/helpers/dumdom.js");
const { repeat } = require("../tests/helpers/utils");

if (require.main === module) {
  dumdom.init();

  const div = document.createElement("div");
  document.appendChild(div);
  mjukna(div);

  document.prepend(document.createElement("div"));
  document.triggerMutationObserver();

  repeat(20)(i => {
    dumdom.triggerRAF();
    document.dumpAsPng().pipe(fs.createWriteStream(`./tmp/${i}.png`));
  });
}
