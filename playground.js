import { init, mjukna } from './index.js';

function setup() {
  const root = document.getElementById('root');
  const adder = document.getElementById('adder');
  const remover = document.getElementById('remover');
  const square = document.getElementById('square');

  adder.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'box';
    root.prepend(div);
    mjukna(div);
  });

  remover.addEventListener('click', () => {
    const div = document.querySelector('.box');
    root.removeChild(div);
  });

  init();
  mjukna(square);
}

setup();
