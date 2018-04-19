function init() {
  const root = document.getElementById('root');
  const adder = document.getElementById('adder');
  const remover = document.getElementById('remover');
  const square = document.getElementById('square');


  adder.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'box';
    root.prepend(div);
  });

  remover.addEventListener('click', () => {
    const div = document.querySelector('.box');
    root.removeChild(div);
  });


  function getSquareTop() {
    const box = square.getBoundingClientRect();
    console.log(box.top);
    return box.top;
  }
  let previousTop = getSquareTop();

  const observer = new MutationObserver((mutations) => {
    console.log('got some mutations', mutations);

    square.style.transition = '';
    square.style.transform = '';
    const newSquareTop = getSquareTop();

    console.log('newSquareTop', newSquareTop);
    const y = previousTop - newSquareTop;
    square.style.transform = `translateY(${y}px)`;
    console.log('setting y to', y);
    previousTop = newSquareTop;

    setTimeout(() => {
      square.style.transition = 'transform 1s';
      square.style.transform = 'translateY(0)';
    }, 1);

    console.log('top diff', newSquareTop - previousTop);
  });

  observer.observe(document, { subtree: true, childList: true });
}

init();
