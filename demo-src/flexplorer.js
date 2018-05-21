import { mjukna } from "./index.js";

[...document.querySelectorAll(".box")].forEach(element => {
  mjukna(element, { scale: true });
});

const byId = document.getElementById.bind(document);
const $ = document.querySelectorAll.bind(document);
const container = byId("flex-container");

function setupListeners() {
  [...$("input[name='align-items']")].forEach(element => {
    element.addEventListener("change", evt => {
      container.style.alignItems = evt.target.value;
    });
  });
  [...$("input[name='justify-content']")].forEach(element => {
    element.addEventListener("change", evt => {
      container.style.justifyContent = evt.target.value;
    });
  });
}

setupListeners();
