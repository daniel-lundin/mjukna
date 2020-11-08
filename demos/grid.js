/* global mjukna */

const random = (min, max) => Math.floor(Math.random() * (max - min) + min);

const animals = document.querySelectorAll(".animal");
const emojis = document.querySelectorAll(".animal span");

function makeItMjukna() {
  return mjukna([...animals, ...emojis], {
    tension: 0.05,
    deceleration: 0.7,
  });
}

async function go() {
  const animation = makeItMjukna();
  animals.forEach((animal) => {
    const from = random(1, 10);
    const to = random(from, 10);

    animal.style.gridColumn = `${from} / ${to}`;
    animal.style.gridRow = `${from} / ${to}`;
  });
  await animation;
  requestAnimationFrame(go);
}

go();
