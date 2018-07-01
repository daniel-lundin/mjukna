document.getElementById("toggle").addEventListener("click", () => {
  mjukna([...document.querySelectorAll("nav, span, button")]);
  document.querySelector("nav").classList.toggle("fixed");
});
