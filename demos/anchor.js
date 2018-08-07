/* global mjukna, h */

const grid = document.querySelector(".grid");

async function dismiss(overlay, target) {
  const animation = mjukna([
    { anchor: overlay, element: () => target },
    {
      anchor: overlay.querySelector("span"),
      element: () => target.querySelector("span")
    }
  ]);

  overlay.remove();
  await animation;
  target.classList.remove("active");
}

function open(target) {
  const anchorNumber = target.querySelector("span");
  const anchorColor = window.getComputedStyle(target).backgroundColor;
  target.classList.add("active");

  const overlay = h.div(
    { class: "overlay", onClick: () => dismiss(overlay, target) },
    h.span({}, anchorNumber.textContent)
  );
  overlay.style.background = anchorColor;

  mjukna([
    { anchor: target, element: () => overlay },
    { anchor: anchorNumber, element: () => overlay.querySelector("span") }
  ]);
  grid.appendChild(overlay);
}

grid.addEventListener("click", function(event) {
  if (event.target.classList.contains("box")) {
    open(event.target);
  }
});
