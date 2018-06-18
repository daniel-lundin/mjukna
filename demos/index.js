/* global mjukna */
const nav = document.querySelector("nav");
const img = document.querySelector("nav img");
const logo = document.querySelector("nav h1");
const content = document.querySelector(".container");

function mjuknaNav() {
  return mjukna([nav, img, content]);
}

function buildMenu() {
  const items = [
    ["#intro", "Introduction"],
    ["#usage", "Usage"],
    ["#enter-exit", "Enter/Exit"],
    ["#nesting", "Nesting"]
  ];

  const ul = document.createElement("ul");
  items.forEach(([anchor, title]) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", anchor);
    a.innerText = title;
    li.appendChild(a);
    ul.appendChild(li);
  });
  return ul;
}

function toggleMenu() {
  mjukna([...document.querySelectorAll("nav li"), nav, img, content], {
    tension: 0.05
  });
  nav.classList.toggle("docked");
  nav.classList.toggle("sidebar");
}

function setupListeners() {
  document.getElementById("start").addEventListener("click", async () => {
    const animation = mjuknaNav();
    logo.parentNode.removeChild(logo);
    nav.classList.remove("initial");
    nav.classList.add("docked");
    await animation;
    mjukna([nav]);
    nav.appendChild(buildMenu());
    img.addEventListener("click", toggleMenu);
  });
}

setupListeners();
