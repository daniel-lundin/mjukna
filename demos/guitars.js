/* global mjukna, GUITARS, h */

const grid = document.querySelector(".grid");

function onDetailClose(index) {
  const gridItem = document.querySelectorAll(".grid-item")[index];
  const detailView = document.querySelector(".detail-view");
  mjukna([
    {
      anchor: detailView.querySelector("h2 span"),
      element: () => gridItem.querySelector("h2 span")
    },
    {
      anchor: detailView.querySelector("img"),
      element: () => gridItem.querySelector("img")
    },
    {
      anchor: detailView.querySelector(".content"),
      element: () => gridItem.querySelector(".background")
    }
  ]);

  detailView.parentNode.removeChild(detailView);
}

function onProductClick(index) {
  const guitar = GUITARS[index];
  const gridItem = document.querySelectorAll(".grid-item")[index];
  const detailView = h.div({ class: "detail-view" }, [
    h.div({ class: "header" }, [
      h.h2({}, h.span({}, guitar.title)),
      h.button({ class: "close", onClick: () => onDetailClose(index) }, "X")
    ]),
    h.div({ class: "content" }, [
      h.h3({}, guitar.subtitle),
      h.div({ class: "price" }, `$${guitar.price}`),
      h.p({ class: "description" }, guitar.description)
    ]),
    h.img({
      src: guitar.img,
      onLoad: async () => {
        // Don't start animation until image is loaded
        const animation = mjukna([
          {
            anchor: gridItem.querySelector("h2 span"),
            element: () => detailView.querySelector("h2 span")
          },
          {
            anchor: gridItem.querySelector("img"),
            element: () => detailView.querySelector("img")
          },
          {
            anchor: gridItem.querySelector(".background"),
            element: () => detailView.querySelector(".content")
          }
        ]);
        document.body.appendChild(detailView);
        await animation;
        detailView.classList.add("active");
      }
    })
  ]);
}

function buildGrid() {
  GUITARS.forEach((guitar, index) => {
    const gridItem = h.div(
      {
        class: "grid-item",
        onClick: () => onProductClick(index)
      },
      h.div({ class: "product" }, [
        h.div({ class: "background" }),
        h.img({ src: guitar.img }),
        h.h2({}, h.span({}, guitar.title)),
        h.h3({}, guitar.subtitle)
      ])
    );

    grid.appendChild(gridItem);
  });
}

buildGrid();
