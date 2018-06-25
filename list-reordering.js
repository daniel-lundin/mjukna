/* global mjukna */
const byId = document.getElementById.bind(document);
const $ = document.querySelectorAll.bind(document);
const todo = byId("todo");
const done = byId("done");

function markDone(element) {
  mjukna([...document.querySelectorAll("input, li, li span, h5, button")]);
  element.parentNode.removeChild(element);
  done.prepend(element);
}

function markUndone(element) {
  mjukna([...document.querySelectorAll("input, li, li span, h5, button")]);
  element.parentNode.removeChild(element);
  todo.appendChild(element);
}

function shuffle(elements, result = []) {
  if (elements.length === 0) return result;
  return result
    .concat(elements.splice(Math.floor(Math.random() * elements.length), 1))
    .concat(shuffle(elements, []));
}
function setupListeners() {
  const checkboxes = Array.from(document.querySelectorAll("input"));
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", event => {
      if (event.target.checked) {
        markDone(checkbox.parentNode);
      } else {
        markUndone(checkbox.parentNode);
      }
    });
  });
  Array.from($(".shuffle")).forEach(button =>
    button.addEventListener("click", function() {
      const ul = byId(this.dataset.list);
      const elements = shuffle(Array.from(ul.children));
      mjukna([...$("li")], { staggerBy: 30 });
      ul.innerHTML = "";
      elements.forEach(e => ul.appendChild(e));
    })
  );
  Array.from($(".sort")).forEach(button =>
    button.addEventListener("click", function() {
      const ul = byId(this.dataset.list);
      const elements = shuffle(Array.from(ul.children));
      elements.sort((a, b) => {
        return a.textContent.localeCompare(b.textContent);
      });
      mjukna([...$("li")], { staggerBy: 30 });
      ul.innerHTML = "";
      elements.forEach(e => ul.appendChild(e));
    })
  );
}

setupListeners();
