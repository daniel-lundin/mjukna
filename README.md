# mjukna

[![Build Status](https://travis-ci.org/daniel-lundin/mjukna.svg?branch=master)](https://travis-ci.org/daniel-lundin/mjukna)
[![gzip size](http://img.badgesize.io/https://unpkg.com/mjukna/dist/browser.js?compression=gzip&color=blue)](https://unpkg.com/mjukna/dist/browser.js)

Combines MutationObserver and FLIP-animations to automatically transition elements into new positions/sizes.

*WIP*

## Background

This library solves the problem of animating

Examples include:
 - List reordering
 - Transition to/from float
 - Shared element transitions
 - Animating flexbox properties(e.g. going from `flex-direction:` `row` to `column`)

This is not a library that tweens CSS-properties(we have plenty of those)

## Usage

The API is quite simple. 

 - Register a list of DOM-elements by calling `mjukna()`
 - mjukna` will save the current positions and wait for the next set of DOM updates.
 - Perform some updates(reorder, add/remove classes, update inline-styles)
 - `mjukna` will measure the new positions/sizes of the registered elements and animate them to their new positions with a combination of performant `transforms`

```js
import mjukna from 'mjukna';

mjukna([list,of,dom-elements], options);

// Do whatever dom-changes you like and watch them transition
```

### Enter/exit animations

Mjukna keeps track of all elements that are added to the DOM. If you want mjukna to do enter transitions for them, set the appropriate `enterFilter`

```js

mjukna([], {
  enterFilter: element => element.classList.contains("list-item"),
  enterAnimation: "squeeze"
  exitAnimation: "fade"
});
```

This will animate all elements that has the class list-item

A predefined set of enter/exit animations are available through the by setting the `enterAnimation` and `exitAnimation` properties in options:

 - fade
 - squeeze
 - squeezeLeft
 - squeezeRight
 - squeezeTop
 - squeezeBottom


### Nested elements

Elements that contain other elements will be distorted...

```js
mjukna([...document.qierySelectorAll('.list-item, .list-item-header'])
```

### DEMOS (WIP)

 - [numbers](https://daniel-lundin.github.io/mjukna/numbers.html)
 - [typography](https://daniel-lundin.github.io/mjukna/dictionary.html)
 - [list reordering](https://daniel-lundin.github.io/mjukna/list-reordering.html)


