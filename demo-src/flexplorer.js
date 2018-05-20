import { mjukna } from "../index.js";

[...document.querySelectorAll(".box")].forEach(element => {
  mjukna(element, { scale: true });
});

const byId = document.getElementById.bind(document);
const container = byId("flex-container");

function setupListeners() {
  byId("align-items").addEventListener("change", event => {
    container.style.alignItems = event.target.value;
  });
  byId("justify-content").addEventListener("change", event => {
    container.style.justifyContent = event.target.value;
  });
}

setupListeners();
