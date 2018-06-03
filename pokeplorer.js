import { mjukna } from "./index.js";

function avatarURL(name) {
  return `https://img.pokemondb.net/artwork/${name.toLowerCase()}.jpg`;
}

const pokes = [
  ["Bulbasaur", "Grass · Poison "],
  ["Ivysaur", "Grass · Poison "],
  ["Venusaur", "Grass · Poison "],
  ["Charmander", "Fire "],
  ["Charmeleon", "Fire "],
  ["Charizard", "Fire · Flying "],
  ["Squirtle", "Water "],
  ["Wartortle", "Water "],
  ["Blastoise", "Water "],
  ["Caterpie", "Bug "],
  ["Metapod", "Bug "],
  ["Butterfree", "Bug · Flying "],
  ["Weedle", "Bug · Poison "],
  ["Kakuna", "Bug · Poison "]
];

const root = document.getElementById("root");

const cards = [];
const images = [];
const names = [];

function buildGrid() {
  pokes.forEach(([name, desc]) => {
    const card = document.createElement("div");
    card.className = "card";
    const pokename = document.createElement("div");
    pokename.className = "name";
    pokename.innerText = name;
    const image = new Image();
    image.src = avatarURL(name);
    card.appendChild(image);
    card.appendChild(pokename);
    root.appendChild(card);
    cards.push(card);
    images.push(image);
    names.push(pokename);
    card.addEventListener("click", () => {
      mjukna(cards.concat(images).concat(names), { staggerBy: 10 });
      cards.forEach(c => c.classList.remove("active"));
      card.classList.toggle("active");
    });
  });
}

buildGrid();
