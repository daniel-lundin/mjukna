import { mjukna } from "./index.js";

const root = document.querySelector(".root");
const inner = document.querySelectorAll(".inner");

function makeItMjukna() {
  mjukna([...inner, root]);
}

["add", "remove"].forEach(evt => {
  document.getElementById(evt).addEventListener("click", () => {
    makeItMjukna();
    root.classList[evt]("custom");
  });
});
