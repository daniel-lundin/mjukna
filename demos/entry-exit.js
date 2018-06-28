/* global mjukna */
const addButton = document.getElementById("add");
const removeButton = document.getElementById("remove");

const enters = [
  "squeeze",
  "squeezeLeft",
  "squeezeRight",
  "squeezeBottom",
  "squeezeTop",
  "fade"
];

const randomEnter = () => enters[Math.floor(Math.random() * enters.length)];

function makeItMjukna() {
  mjukna([...document.querySelectorAll(".box"), addButton, removeButton], {
    enterFilter: () => true,
    enterAnimation: randomEnter()
  });
}
const colors = ["#AA3939", "#FFAAAA", "#D46A6A", "#801515", "#550000"];

addButton.addEventListener("click", () => {
  makeItMjukna();
  const element = document.createElement("div");
  element.style.background = colors[Math.floor(Math.random() * colors.length)];
  element.classList.add("box");
  const children = document.body.children;
  document.body.insertBefore(
    element,
    children[Math.floor(Math.random() * children.length)]
  );
});

removeButton.addEventListener("click", () => {
  makeItMjukna();

  const divs = document.querySelectorAll("div");
  document.body.removeChild(divs[Math.floor(Math.random() * divs.length)]);
});
