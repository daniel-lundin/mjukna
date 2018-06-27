export function multiply(a, b, res) {
  res[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
  res[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
  res[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];

  res[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
  res[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
  res[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];

  res[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
  res[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
  res[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
}

function translate(matrix, x, y) {
  matrix[0] = 1;
  matrix[1] = 0;
  matrix[2] = x;

  matrix[3] = 0;
  matrix[4] = 1;
  matrix[5] = y;

  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 1;
}
function scale(matrix, x, y) {
  matrix[0] = x;
  matrix[1] = 0;
  matrix[2] = 0;

  matrix[3] = 0;
  matrix[4] = y;
  matrix[5] = 0;

  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 1;
}

function identity(matrix) {
  matrix[0] = 1;
  matrix[1] = 0;
  matrix[2] = 0;

  matrix[3] = 0;
  matrix[4] = 1;
  matrix[5] = 0;

  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 1;
}

function moveArray(src, dest) {
  dest[0] = src[0];
  dest[1] = src[1];
  dest[2] = src[2];
  dest[3] = src[3];
  dest[4] = src[4];
  dest[5] = src[5];
  dest[6] = src[6];
  dest[7] = src[7];
  dest[8] = src[8];
}

const a = new Float32Array(9);
const b = new Float32Array(9);

export function createMatrix() {
  const data = new Float32Array(9);
  identity(data);
  return {
    t(x, y) {
      moveArray(data, a);
      translate(b, x, y);
      multiply(a, b, data);
      return this;
    },
    s(x, y) {
      moveArray(data, a);
      scale(b, x, y);
      multiply(a, b, data);
      return this;
    },
    css() {
      return `matrix(${data[0].toFixed(5)}, ${data[1].toFixed(
        5
      )}, ${data[3].toFixed(5)}, ${data[4].toFixed(5)}, ${data[2].toFixed(
        5
      )}, ${data[5].toFixed(5)})`;
    },
    clear() {
      identity(data);
      return this;
    }
  };
}
