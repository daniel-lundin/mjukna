import { mjukna } from "./index.js";

const thing = document.getElementById("thing");
mjukna(thing, { scale: true });

const byId = document.getElementById.bind(document);

function setupListeners() {
  byId("make-small").addEventListener("click", () => {
    console.log("turning it small");
    thing.classList.remove("big");
  });
  byId("make-big").addEventListener("click", () => {
    console.log("turning it big");
    thing.classList.add("big");
  });
}

setupListeners();
