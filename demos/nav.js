document.getElementById("toggle").addEventListener("click", () => {
  mjukna([...document.querySelectorAll("nav, span, button")]);
  document.querySelector(".container").classList.toggle("fixed");
});
