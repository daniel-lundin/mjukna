/* global h */
import mjukna from "../src/index.js";

const grid = document.querySelector(".grid");

async function dismiss(overlay, target) {
  const animation = mjukna([
    {
      anchor: overlay.querySelector(".background"),
      element: () => target.querySelector(".background"),
    },
    {
      anchor: overlay.querySelector("span"),
      element: () => target.querySelector("span"),
    },
  ]);

  overlay.remove();
  await animation;
  target.classList.remove("active");
}

function open(target) {
  const anchorNumber = target.querySelector("span");
  const anchorColor = window.getComputedStyle(
    target.querySelector(".background")
  ).backgroundColor;
  target.classList.add("active");

  const overlay = h.div(
    { class: "overlay", onClick: () => dismiss(overlay, target) },
    [h.div({ class: "background" }), h.span({}, anchorNumber.textContent)]
  );
  overlay.querySelector(".background").style.background = anchorColor;

  mjukna([
    { anchor: target, element: () => overlay.querySelector(".background") },
    { anchor: anchorNumber, element: () => overlay.querySelector("span") },
  ]);
  grid.appendChild(overlay);
}

grid.addEventListener("click", function (event) {
  if (event.target.classList.contains("box")) {
    open(event.target);
  }
});
