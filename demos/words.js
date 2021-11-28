/* global mjukna */

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dictum nisl et ligula commodo sollicitudin. Cras volutpat consectetur lorem, et lobortis purus dictum sit amet. Maecenas eget eros id lacus egestas maximus.";

function makeItMjukna() {
  const elements = document.querySelectorAll("span, article, img");
  const elementConfigs = Array.from(elements).map(element => ({ element}));
  console.log('elementConfigs', elementConfigs);
  return mjukna(elementConfigs, { tension: 0.1, decelaration: 0.7, staggerBy: 5 });
}
const $ = document.querySelectorAll.bind(document);
const article = document.querySelector("article");

function setupListeners() {
  [...$("input[name='font-size']")].forEach(element => {
    element.addEventListener("change", evt => {
      const animation = makeItMjukna();
      article.classList.remove("font-small");
      article.classList.remove("font-medium");
      article.classList.remove("font-large");
      article.classList.add(evt.target.value);
      animation.execute();
    });
  });
  [...$("input[name='box-size']")].forEach(element => {
    element.addEventListener("change", evt => {
      const animation = makeItMjukna();
      article.style.width = evt.target.value;
      animation.execute();
    });
  });
  [...$("input[name='image-style']")].forEach(element => {
    element.addEventListener("change", evt => {
      const animation = makeItMjukna();
      article.classList.remove("image-left");
      article.classList.remove("image-block");
      article.classList.remove("image-right");
      article.classList.add(evt.target.value);
      animation.execute();
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
  lorem.split(" ").forEach(word => {
    const span = document.createElement("span");
    span.innerText = word;
    root.appendChild(span);
    root.appendChild(document.createTextNode(" "));
  });
}

setup();
