/* global mjukna */

const texts = [
  "1 (one, also called unit, unity, and (multiplicative) identity) is a number, numeral, and glyph. It represents a single entity, the unit of counting or measurement. For example, a line segment of unit length is a line segment of length 1. It is also the first of the infinite sequence of natural numbers, followed by 2.",
  'Two is the smallest prime number, and the only even prime number (for this reason it is sometimes called "the oddest prime"). The next prime is three. Two and three are the only two consecutive prime numbers. 2 is the first Sophie Germain prime, the first factorial prime, the first Lucas prime, the first Ramanujan prime, and the first Smarandache-Wellin prime.',
  "Three is the largest number still written with as many lines as the number represents. (The Ancient Romans usually wrote 4 as IIII, but this was almost entirely replaced by the subtractive notation IV in the Middle Ages.) To this day 3 is written as three lines in Roman and Chinese numerals.",
  "Four is the smallest composite number, its proper divisors being 1 and 2. 4 is the smallest squared prime (p2) and the only even number in this form. 4 is also the only square one more than a prime number.  A number is a multiple of 4 if its last two digits are a multiple of 4. For example, 1092 is a multiple of 4 because 92 = 4 x 23."
];

function makeItMjukna() {
  const cells = [...document.querySelectorAll(".cell")];
  const headings = [...document.querySelectorAll(".cell span")];

  return mjukna([...cells, ...headings], {
    enterFilter: () => true,
    spring: {
      stiffness: 10,
      damping: 0.5
    }
  });
}

async function unselectNumber() {
  const active = document.querySelector(".active");
  if (active) {
    const animation = makeItMjukna();
    active.style.zIndex = 1;
    active.classList.remove("active");
    const info = active.querySelector("p");
    info.remove();
    await animation;
    active.style.zIndex = "";
  }
  return active;
}
async function selectNumber(cell, index) {
  const active = await unselectNumber();
  if (cell === active) return;

  const animation = makeItMjukna();
  cell.classList.toggle("active");
  await animation;

  const info = document.createElement("p");
  info.innerText = texts[index];
  makeItMjukna();
  cell.appendChild(info);
}

function setupListeners() {
  const cells = Array.from(document.querySelectorAll(".cell"));
  cells.forEach((cell, index) =>
    cell.addEventListener("click", () => selectNumber(cell, index))
  );
}

setupListeners();
