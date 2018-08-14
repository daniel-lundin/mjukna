/* global h, mjukna */
const characters = Array.from("abcdefghiljkmnopqrstuvxyz");

const alphabetElement = document.querySelector(".alphabet");
const wordElement = document.querySelector(".word");

const words = ["game", "dice", "what"];

function generateAlphabet() {
  characters.forEach(letter => {
    alphabetElement.appendChild(h.span({ class: letter }, letter));
  });
}

function makeWord() {
  const word = words[0];
  mjukna(
    Array.from(word).map(letter => ({
      anchor: document.querySelector(`.${letter}`),
      element: () => document.querySelector(`.word-${letter}`)
    }))
  );

  Array.from(word).forEach(letter => {
    document.querySelector(`.${letter}`).remove();
    wordElement.appendChild(h.span({ class: `word-${letter}` }, letter));
  });
}

generateAlphabet();
makeWord();
