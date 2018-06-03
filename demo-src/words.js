import { mjukna } from "./index.js";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dictum nisl et ligula commodo sollicitudin. Cras volutpat consectetur lorem, et lobortis purus dictum sit amet. Maecenas eget eros id lacus egestas maximus.";

function makeItMjukna() {
  const elements = document.querySelectorAll("span, article, img");
  mjukna([...elements]);
}
function setupListeners() {
  document.getElementById("make-font-small").addEventListener("click", () => {
    makeItMjukna();
    const elements = [...document.querySelectorAll("span")];
    elements.forEach(e => {
      e.classList.remove("medium");
      e.classList.remove("big");
      e.classList.add("small");
    });
  });
  document.getElementById("make-font-medium").addEventListener("click", () => {
    makeItMjukna();
    const elements = [...document.querySelectorAll("span")];
    elements.forEach(e => {
      e.classList.remove("small");
      e.classList.remove("big");
      e.classList.add("medium");
    });
  });
  document.getElementById("make-font-big").addEventListener("click", () => {
    makeItMjukna();
    const elements = [...document.querySelectorAll("span")];
    elements.forEach(e => {
      e.classList.remove("small");
      e.classList.remove("medium");
      e.classList.add("big");
    });
  });

  document.getElementById("make-box-small").addEventListener("click", () => {
    makeItMjukna();
    const box = document.querySelector("article");
    box.classList.remove("medium");
    box.classList.remove("big");
    box.classList.add("small");
  });
  document.getElementById("make-box-medium").addEventListener("click", () => {
    makeItMjukna();
    const box = document.querySelector("article");
    box.classList.add("medium");
    box.classList.remove("big");
    box.classList.remove("small");
  });
  document.getElementById("make-box-big").addEventListener("click", () => {
    makeItMjukna();
    const box = document.querySelector("article");
    box.classList.add("big");
    box.classList.remove("medium");
    box.classList.remove("small");
  });

  document.getElementById("float-image").addEventListener("click", () => {
    makeItMjukna();
    const image = document.querySelector("img");
    image.style.float = "left";
  });
  document.getElementById("unfloat-image").addEventListener("click", () => {
    makeItMjukna();
    const image = document.querySelector("img");
    image.style.float = "initial";
  });
}
function setup() {
  setupListeners();
  const root = document.getElementById("root");

  const image = new Image();
  image.src =
    "https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260";
  root.appendChild(image);
  lorem.split(" ").forEach(word => {
    const span = document.createElement("span");
    span.innerText = word;
    root.appendChild(span);
    root.appendChild(document.createTextNode(" "));
  });
}

setup();
