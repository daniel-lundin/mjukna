import { mjukna } from "./index.js";

const container = document.querySelector(".container");
const inner = document.querySelectorAll(".inner");

function makeItMjukna() {
  mjukna([...inner, container], { scale: true });
}

["add", "remove"].forEach(evt => {
  document.getElementById(evt).addEventListener("click", () => {
    makeItMjukna();
    container.classList[evt]("custom");
  });
});
