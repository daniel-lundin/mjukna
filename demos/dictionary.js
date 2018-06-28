/* global mjukna */

const descriptions = {
  function:
    "In mathematics, a <strong>function</strong> was originally the idealization of how a varying quantity depends on another quantity. For example, the position of a planet is a function of time.",
  "absolute value":
    "The <strong>absolute value</strong> or modulus |x| of a real number x is the non-negative value of x without regard to its sign.",
  chord:
    "A <strong>chord</strong>, in music, is any harmonic set of pitches consisting of two or more (usually three or more) notes (also called pitches) that are heard as if sounding simultaneously"
};

const imageText =
  "By wrapping each word in a span-tag we can animate an image going from static to float. Click the image above to toggle it between floating and static. Adding staggerBy will give the animation a more fluid feeling. All we're doing is toggling a class on the image element.";

const dialog = document.querySelector("dialog");
const main = document.querySelector("main");

async function describeWord(anchor, word) {
  const animation = mjukna([
    { anchor: () => anchor, element: () => dialog.querySelector("strong") },
    { anchor: () => anchor, element: () => dialog.querySelector("h5 span") },
    {
      anchor: () => anchor,
      element: () => dialog.querySelector(".backdrop")
    }
  ]);
  dialog.querySelector("h5").innerHTML = `<span>${word}</span>`;
  dialog.querySelector("p").innerHTML = descriptions[word];
  dialog.classList.remove("hidden");
  await animation;
  dialog.classList.remove("stealth");
}

function setup() {
  const words = document.querySelectorAll("strong");

  words.forEach(word => {
    word.addEventListener("click", function(evt) {
      evt.preventDefault();

      const text = this.textContent;
      describeWord(this, text);
    });
  });

  dialog.querySelector("button").addEventListener("click", () => {
    dialog.classList.add("hidden");
    dialog.classList.add("stealth");
  });

  const paragraph = document.createElement("p");
  imageText.split(" ").forEach(word => {
    const span = document.createElement("span");
    span.innerText = word;
    paragraph.appendChild(span);
    paragraph.appendChild(document.createTextNode(" "));
  });
  main.appendChild(paragraph);
  document.querySelector("img").addEventListener("click", function() {
    mjukna([...document.querySelectorAll("img, span")], {
      staggerBy: 5
    });
    this.classList.toggle("float");
  });
}

setup();
