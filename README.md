# Mjukna

[![Build Status](https://travis-ci.org/daniel-lundin/mjukna.svg?branch=master)](https://travis-ci.org/daniel-lundin/mjukna)
[![gzip size](http://img.badgesize.io/https://unpkg.com/mjukna/dist/browser.js?compression=gzip&color=blue)](https://unpkg.com/mjukna/dist/browser.js)

Combines MutationObserver and FLIP-animations to automatically transition elements into new positions/sizes.

*WIP*

## Install

`npm install mjukna`

## Usage

```js
import mjukna from 'mjukna';

mjukna([list,of,dom-elements], options);

// Do whatever dom-changes you like and watch them transition
```

### Enter/exit

Mjukna keeps track of all elements that are added to the DOM. If you want mjukna to do enter transitions for them, set the appropriate `enterFilter`

```js

mjukna([], {
  enterFilter: (element) => element.classList.contains('list-item'),
})
```

A predefined set of enter/exit animations are available through the by setting the `enterAnimation` and `exitAnimation` properties in options:

 - squeeze
 - squeezeLeft
 - squeezeRight
 - squeezeTop
 - squeezeBottom


This will animate all elements that has the class list-item

### Nested elements

Elements that contain other elements will be distorted...

```js
mjukna([...document.qierySelectorAll('.list-item, .list-item-header'])
```

### DEMOS (WIP)

 - [numbers](https://daniel-lundin.github.io/mjukna/numbers.html)
 - [typography](https://daniel-lundin.github.io/mjukna/dictionary.html)
 - [list reordering](https://daniel-lundin.github.io/mjukna/list-reordering.html)


