import { init, mjukna } from "./index.js";
const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dictum nisl et ligula commodo sollicitudin. Cras volutpat consectetur lorem, et lobortis purus dictum sit amet. Maecenas eget eros id lacus egestas maximus.";

function setup() {
  const root = document.getElementById("root");
  const addHeader = document.getElementById("add-header");
  const removeHeader = document.getElementById("remove-header");
  const addParagraph = document.getElementById("add-paragraph");
  const removeParagraph = document.getElementById("remove-paragraph");
  const addBall = document.getElementById("add-ball");
  const removeBall = document.getElementById("remove-ball");
  const square = document.getElementById("square");
  const article = document.getElementById("article");

  addBall.addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "box";
    root.prepend(div);
    mjukna(div);
  });

  addParagraph.addEventListener("click", () => {
    const p = document.createElement("p");
    p.innerText = lorem;
    article.appendChild(p);
    mjukna(p);
  });

  removeParagraph.addEventListener("click", () => {
    const p = document.querySelector("p");
    article.removeChild(p);
  });

  addHeader.addEventListener("click", () => {
    const h2 = document.createElement("h2");
    h2.innerText = "Header";
    article.appendChild(h2);
    mjukna(h2);
  });

  removeHeader.addEventListener("click", () => {
    const h2 = document.querySelector("h2");
    article.removeChild(h2);
  });

  removeBall.addEventListener("click", () => {
    const div = document.querySelector(".box");
    root.removeChild(div);
  });

  init();
  mjukna(square);
}

setup();
