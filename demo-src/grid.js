import { mjukna } from "./index.js";

const random = (min, max) => Math.floor(Math.random() * (max - min) + min);
const colors = ["tomato", "crimson", "aliceblue", "#bada55", "#c0ff3"];

const animals = document.querySelectorAll(".animal");

animals.forEach(element => {
  mjukna(element, { scale: true });
});

setInterval(() => {
  animals.forEach(animal => {
    const from = random(1, 10);
    const to = random(from, 10);
    const background = colors[random(0, colors.length - 1)];

    console.log(from, to);

    animal.style.gridColumn = `${from} / ${to}`;
    animal.style.background = background;
  });
}, 1500);
