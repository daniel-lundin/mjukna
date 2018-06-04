import { mjukna } from "./index.js";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dictum nisl et ligula commodo sollicitudin. Cras volutpat consectetur lorem, et lobortis purus dictum sit amet. Maecenas eget eros id lacus egestas maximus.";

function makeItMjukna() {
  const elements = document.querySelectorAll("span, article, img, .card-title");
  mjukna([...elements]);
}
function setupListeners() {
  const fontsizeButtons = document.querySelectorAll(".font-size");
  fontsizeButtons.forEach(element => {
    element.addEventListener("click", function() {
      makeItMjukna();
      fontsizeButtons.forEach(e => e.classList.remove("active"));
      this.classList.add("active");

      const elements = [...document.querySelectorAll("span")];
      elements.forEach(e => {
        e.classList.remove("small");
        e.classList.remove("medium");
        e.classList.remove("large");
        e.classList.add(this.dataset.value);
      });
    });
  });

  const boxButtons = document.querySelectorAll(".box-size");
  boxButtons.forEach(element => {
    element.addEventListener("click", function() {
      makeItMjukna();
      boxButtons.forEach(e => e.classList.remove("active"));
      this.classList.add("active");
      const box = document.querySelector("article");
      box.classList.remove("medium");
      box.classList.remove("big");
      box.classList.remove("small");
      box.classList.add(this.dataset.value);
    });
  });
  function resetImageStyle() {
    document.querySelectorAll(".image-style").forEach(e => {
      e.classList.remove("active");
    });
  }
  document
    .getElementById("float-image-left")
    .addEventListener("click", function() {
      makeItMjukna();
      resetImageStyle();
      const image = document.querySelector("img");
      image.style.float = "left";
      image.style.width = "50%";
      image.style.margin = "10px";
      this.classList.add("active");
    });
  document
    .getElementById("unfloat-image")
    .addEventListener("click", function() {
      makeItMjukna();
      resetImageStyle();
      const image = document.querySelector("img");
      image.style.float = "initial";
      image.style.width = "100%";
      image.style.margin = "0";
      this.classList.add("active");
    });
  document
    .getElementById("float-image-right")
    .addEventListener("click", function() {
      makeItMjukna();
      resetImageStyle();
      const image = document.querySelector("img");
      image.style.float = "right";
      image.style.width = "50%";
      image.style.margin = "10px";
      this.classList.add("active");
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
