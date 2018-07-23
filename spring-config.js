/* global mjukna */

const byId = document.getElementById.bind(document);

function setupListeners() {
  const button = document.querySelector("button");
  button.addEventListener("click", event => {
    event.preventDefault();
    mjukna([button, button.querySelector("span")], {
      spring: {
        stiffness: parseFloat(byId("stiffness").value),
        damping: parseFloat(byId("damping").value)
      }
    });

    button.classList.toggle("big");
  });
}

setupListeners();
