/* global mjukna */
const addButton = document.getElementById("add");
const removeButton = document.getElementById("remove");

const root = document.querySelector(".root");

function makeItMjukna() {
  mjukna(document.querySelectorAll(".root .box, #add, #remove"), {
    enterFilter: () => true,
    spring: {
      stiffness: 2,
      damping: 0.3
    }
  });
}
const colors = ["#AA3939", "#FFAAAA", "#D46A6A", "#801515", "#550000"];

addButton.addEventListener("click", () => {
  makeItMjukna();
  const element = document.createElement("div");
  element.style.background = colors[Math.floor(Math.random() * colors.length)];
  element.classList.add("box");
  root.prepend(element);
});

removeButton.addEventListener("click", () => {
  makeItMjukna();

  const div = document.querySelector(".box");
  div.remove();
});
