const path = require("path");
const { exec } = require("child_process");
const assert = require("assert");

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

function deepEquals(a, b) {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch (e) {
    return false;
  }
}

async function getMjuknaCode() {
  return new Promise((resolve, reject) => {
    exec(
      "esbuild src/index.ts --bundle --global-name=mjukna --banner:js='(() => {' --footer:js='window.mjukna=mjukna.default;})()'",
      (err, stdout) => {
        if (err) {
          return reject(err);
        }
        resolve(stdout);
      }
    );
  });
}

const assertEqualPositions = (pos1, pos2) => {
  if (Object.keys(pos1).some((key) => Math.abs(pos1[key] - pos2[key]) > 0.01))
    assert.deepStrictEqual(pos1, pos2);
};

const repeat = (length) => (cb) =>
  Array.from({ length }).forEach((_, index) => cb(index));

module.exports = {
  deepEquals,
  assertEqualPositions,
  sleep,
  repeat,
  getMjuknaCode,
};
