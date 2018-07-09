function createElement(type, props, children) {
  const element = document.createElement(type);

  const attributes = Object.keys(props).filter(prop => !prop.startsWith("on"));
  const eventHandlers = Object.keys(props).filter(prop =>
    prop.startsWith("on")
  );

  attributes.forEach(prop => {
    element.setAttribute(prop, props[prop]);
  });
  eventHandlers.forEach(handler => {
    const eventName = handler.substr(2).toLowerCase();
    element.addEventListener(eventName, props[handler]);
  });

  if (typeof children === "string") {
    element.innerText = children;
  } else {
    [].concat(children).forEach(child => element.appendChild(child));
  }

  return element;
}
const tags = ["p", "div", "img", "span", "h1", "h2", "h3", "button"];
const h = tags.reduce((acc, tag) => {
  return Object.assign(acc, {
    [tag]: (props, children = []) => createElement(tag, props, children)
  });
}, {});
