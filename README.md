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

Mjukna keeps track of all elements that are added and removed from the DOM. If you want mjukna to do enter/exit transitions for them, set the appropriate `enterFilter` and/or `exitFilter`

```js

mjukna([], {
  enterFilter: (element) => element.classList.contains('list-item'),
  exitFilter: (element) => element.classList.contains('list-item'),
})
```

This will animate all elements that has the class list-item

### Nested elements

Elements that contain other elements will be distorted...

```js
const all = document.querySelectorAll.bind(document);
mjukna([...all('.list-item'), ...all('list-item-header')])
```
