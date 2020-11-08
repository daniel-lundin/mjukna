import mjukna from "../src/index.js";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dictum nisl et ligula commodo sollicitudin. Cras volutpat consectetur lorem, et lobortis purus dictum sit amet. Maecenas eget eros id lacus egestas maximus.";

function makeItMjukna() {
  const elements = document.querySelectorAll("span, article .backdrop, img");
  mjukna([...elements], {
    spring: { stiffness: 5, damping: 0.3 },
    staggerBy: 5,
  });
}
const $ = document.querySelectorAll.bind(document);
const article = document.querySelector("article");

function setupListeners() {
  [...$("input[name='font-size']")].forEach((element) => {
    element.addEventListener("change", (evt) => {
      makeItMjukna();
      article.classList.remove("font-small");
      article.classList.remove("font-medium");
      article.classList.remove("font-large");
      article.classList.add(evt.target.value);
    });
  });
  [...$("input[name='box-size']")].forEach((element) => {
    element.addEventListener("change", (evt) => {
      makeItMjukna();
      article.style.width = evt.target.value;
    });
  });
  [...$("input[name='image-style']")].forEach((element) => {
    element.addEventListener("change", (evt) => {
      makeItMjukna();
      article.classList.remove("image-left");
      article.classList.remove("image-block");
      article.classList.remove("image-right");
      article.classList.add(evt.target.value);
    });
  });
}
function setup() {
  setupListeners();
  const root = document.getElementById("root");

  const image = new Image();
  image.src =
    "https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260";
  root.appendChild(image);
  lorem.split(" ").forEach((word) => {
    const span = document.createElement("span");
    span.innerText = word;
    root.appendChild(span);
    root.appendChild(document.createTextNode(" "));
  });
}

setup();
