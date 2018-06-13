/* global mjukna */

const classes = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight"
];

let aIndex = 0;
let bIndex = 4;
const a = document.querySelector(".a");
const b = document.querySelector(".b");

a.classList.add(classes[aIndex]);
b.classList.add(classes[bIndex]);

const next = async () => {
  const promise = mjukna([a, b], { tension: 0.7, deceleration: 0.5 });

  a.classList.remove(...classes);
  b.classList.remove(...classes);
  aIndex = (aIndex + 1) % classes.length;
  bIndex = (bIndex + 1) % classes.length;
  a.classList.add(classes[aIndex]);
  b.classList.add(classes[bIndex]);
  await promise;
  next();
};

next();
