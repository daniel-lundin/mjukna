/* global mjukna */

const detailedNumber = document.querySelector(".detailed-number");
const numbers = document.querySelector(".numbers");

let selectedNumber;

function unselectNumber(number) {
  if (!number) return;

  const h1 = document.querySelector("h1");
  h1.parentNode.removeChild(h1);
}

function selectNumber(cell, number) {
  mjukna(
    [
      ...document.querySelectorAll(".cell"),
      ...document.querySelectorAll("h1"),
      {
        anchor: () => cell.querySelector("span"),
        element: () => document.querySelector(".detailed-number h1 span")
      }
    ],
    { exitFilter: () => true }
  );
  unselectNumber(selectedNumber);
  const bigNumber = document.createElement("h1");
  const span = document.createElement("span");
  span.innerText = number;
  bigNumber.appendChild(span);
  detailedNumber.appendChild(bigNumber);
  cell.parentNode.removeChild(cell);

  selectedNumber = number;
}

function createCell(number) {
  const cell = document.createElement("cell");
  cell.classList.add("cell");
  cell.setAttribute("id", `cell-${number}`);
  const span = document.createElement("span");
  span.innerText = number;
  cell.appendChild(span);
  cell.addEventListener("click", () => selectNumber(cell, number));
  return cell;
}

const byId = id => document.getElementById(id);
function setupListeners() {
  byId("add-button").addEventListener("click", () => {
    mjukna(
      [
        ...document.querySelectorAll(".cell"),
        ...document.querySelectorAll(".cell span")
      ],
      {
        enterFilter: () => true
      }
    );
    const cell = createCell(numbers.children.length);
    numbers.insertBefore(cell, byId("add-button"));
  });
}

function init() {
  numbers.prepend(createCell(2));
  numbers.prepend(createCell(1));
  setupListeners();
}

init();
