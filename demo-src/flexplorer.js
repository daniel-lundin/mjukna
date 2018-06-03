import { mjukna } from "./index.js";

function makeItMjukt() {
  [...document.querySelectorAll(".box")].forEach(element => {
    mjukna(element, { scale: true, staggerBy: 20 });
  });
}

const byId = document.getElementById.bind(document);
const $ = document.querySelectorAll.bind(document);
const container = byId("flex-container");

function setupListeners() {
  [...$("input[name='align-items']")].forEach(element => {
    element.addEventListener("change", evt => {
      makeItMjukt();
      container.style.alignItems = evt.target.value;
    });
  });
  [...$("input[name='justify-content']")].forEach(element => {
    element.addEventListener("change", evt => {
      makeItMjukt();
      container.style.justifyContent = evt.target.value;
    });
  });
  [...$("input[name='flex-direction']")].forEach(element => {
    element.addEventListener("change", evt => {
      makeItMjukt();
      container.style.flexDirection = evt.target.value;
    });
  });
}

setupListeners();
