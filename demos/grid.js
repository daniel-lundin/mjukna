/* global mjukna */

const random = (min, max) => Math.floor(Math.random() * (max - min) + min);

const animals = document.querySelectorAll(".animal");
const emojis = document.querySelectorAll(".animal span");

function makeItMjukna() {
  // mjukna([...emojis, ...animals], { tension: 0.001, deceleration: 0.5 });
  mjukna([...animals, ...emojis]);
}

setInterval(() => {
  makeItMjukna();
  animals.forEach(animal => {
    const from = random(1, 10);
    const to = random(from, 10);

    animal.style.gridColumn = `${from} / ${to}`;
  });
}, 2500);
