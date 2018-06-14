/* global mjukna */
const addButton = document.getElementById("add");
const removeButton = document.getElementById("remove");

function makeItMjukna() {
  mjukna([...document.querySelectorAll(".box"), addButton, removeButton]);
}

addButton.addEventListener("click", () => {
  makeItMjukna();
  const element = document.createElement("div");
  element.classList.add("box");
  document.body.prepend(element);
});

removeButton.addEventListener("click", () => {
  makeItMjukna();
  document.body.removeChild(document.querySelector("div"));
});
