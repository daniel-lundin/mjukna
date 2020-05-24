import mjukna from "../src/index.js";

document.getElementById("toggle").addEventListener("click", () => {
  mjukna([...document.querySelectorAll("nav, span, button")], {
    staggerBy: 100,
    spring: {
      stiffness: 1,
    },
  });
  document.querySelector(".container").classList.toggle("fixed");
});
