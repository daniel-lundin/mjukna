import mjukna from "../src/index.js";

const byId = document.getElementById.bind(document);

function setupListeners() {
  const button = document.querySelector("button");
  button.addEventListener("click", (event) => {
    event.preventDefault();
    mjukna(byId("example"), {
      spring: {
        tension: parseFloat(byId("tension").value),
        friction: parseFloat(byId("friction").value),
        velocity: parseFloat(byId("initial-velocity").value),
        mass: parseFloat(byId("mass").value),
      },
    });

    byId("example").classList.toggle("active");
  });
}

setupListeners();
