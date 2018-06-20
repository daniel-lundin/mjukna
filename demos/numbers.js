/* global mjukna */
const detailedNumber = document.querySelector(".detailed-number");
const numbers = document.querySelector(".numbers");

function selectNumber(cell, number) {
  mjukna([
    ...document.querySelectorAll("h1"),
    {
      anchor: () => cell.querySelector("span"),
      element: () => document.querySelector(".detailed-number h1 span")
    }
  ]);
  const bigNumber = document.createElement("h1");
  const span = document.createElement("span");
  span.innerText = number;
  bigNumber.appendChild(span);
  detailedNumber.appendChild(bigNumber);
}

function createCell(number) {
  const cell = document.createElement("cell");
  cell.classList.add("cell");
  const span = document.createElement("span");
  span.innerText = number;
  cell.appendChild(span);
  cell.addEventListener("click", () => selectNumber(cell, number));
  return cell;
}

const byId = id => document.getElementById(id);
function setupListeners() {
  byId("add-button").addEventListener("click", () => {
    mjukna([...document.querySelectorAll(".cell")], {
      enterFilter: () => true
    });
    const cell = createCell(numbers.children.length);
    numbers.insertBefore(cell, byId("add-button"));
  });
}

setupListeners();
