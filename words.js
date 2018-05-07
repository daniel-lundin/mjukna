import { mjukna } from "./index.js";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dictum nisl et ligula commodo sollicitudin. Cras volutpat consectetur lorem, et lobortis purus dictum sit amet. Maecenas eget eros id lacus egestas maximus.";

function setupListeners() {
  document.getElementById("make-font-small").addEventListener("click", () => {
    const elements = [...document.querySelectorAll("span")];
    elements.forEach(e => {
      e.classList.remove("medium");
      e.classList.remove("big");
      e.classList.add("small");
    });
  });
  document.getElementById("make-font-medium").addEventListener("click", () => {
    const elements = [...document.querySelectorAll("span")];
    elements.forEach(e => {
      e.classList.remove("small");
      e.classList.remove("big");
      e.classList.add("medium");
    });
  });
  document.getElementById("make-font-big").addEventListener("click", () => {
    const elements = [...document.querySelectorAll("span")];
    elements.forEach(e => {
      e.classList.remove("small");
      e.classList.remove("medium");
      e.classList.add("big");
    });
  });

  document.getElementById("make-box-small").addEventListener("click", () => {
    const box = document.querySelector("article");
    box.classList.remove("medium");
    box.classList.remove("big");
    box.classList.add("small");
  });
  document.getElementById("make-box-medium").addEventListener("click", () => {
    const box = document.querySelector("article");
    box.classList.add("medium");
    box.classList.remove("big");
    box.classList.remove("small");
  });
  document.getElementById("make-box-big").addEventListener("click", () => {
    const box = document.querySelector("article");
    box.classList.add("big");
    box.classList.remove("medium");
    box.classList.remove("small");
  });
}
function setup() {
  setupListeners();
  const root = document.getElementById("root");

  lorem.split(" ").forEach(word => {
    const span = document.createElement("span");
    mjukna(span, { scale: true });
    span.innerText = word;
    root.appendChild(span);
    root.appendChild(document.createTextNode(" "));
  });
}

setup();
