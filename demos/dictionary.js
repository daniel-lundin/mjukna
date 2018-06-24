/* global mjukna */

const descriptions = {
  function:
    "In mathematics, a <strong>function</strong> was originally the idealization of how a varying quantity depends on another quantity. For example, the position of a planet is a function of time.",
  "absolute value":
    "The graph of the <strong>absolute value</strong> function for real numbers The absolute value of a number may be thought of as its distance from zero. "
};

const dialog = document.querySelector("dialog");

async function describeWord(anchor, word) {
  const animation = mjukna([
    { anchor: () => anchor, element: () => dialog.querySelector("strong") },
    { anchor: () => anchor, element: () => dialog.querySelector("h5 span") },
    { anchor: () => anchor, element: () => dialog.querySelector(".backdrop") }
  ]);
  dialog.querySelector("h5").innerHTML = `<span>${word}</span>`;
  dialog.querySelector("p").innerHTML = descriptions[word];
  dialog.showModal();
  await animation;
  dialog.classList.remove("stealth");
}
function setupListeners() {
  const words = document.querySelectorAll("strong");

  words.forEach(word => {
    word.addEventListener("click", function(evt) {
      evt.preventDefault();

      const text = this.textContent;
      describeWord(this, text);
    });
  });

  dialog.querySelector("button").addEventListener("click", () => {
    dialog.close();
    dialog.classList.add("stealth");
  });
}

setupListeners();
