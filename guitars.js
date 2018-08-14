/* global mjukna, GUITARS, h */

const grid = document.querySelector(".grid");
const mjuknaConfig = { spring: { stiffness: 10, damping: 0.6 } };

async function onDetailClose(index) {
  const gridItem = document.querySelectorAll(".grid-item")[index];
  const detailView = document.querySelector(".detail-view");
  gridItem.classList.add("motion");
  const animation = mjukna(
    [
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
      },
      {
        anchor: detailView.querySelector(".header"),
        element: () => gridItem.querySelector(".placeholder")
      }
    ],
    mjuknaConfig
  );

  detailView.remove();
  gridItem.querySelector("img").style.opacity = 1;
  await animation;
  gridItem.classList.remove("motion");
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
        const animation = mjukna(
          [
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
            },
            {
              anchor: gridItem.querySelector(".placeholder"),
              element: () => detailView.querySelector(".header")
            }
          ],
          mjuknaConfig
        );
        document.body.appendChild(detailView);
        gridItem.querySelector("img").style.opacity = 0;
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
        h.div({ class: "placeholder" }),
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
