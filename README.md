# mjukna

[![Build Status](https://travis-ci.org/daniel-lundin/mjukna.svg?branch=master)](https://travis-ci.org/daniel-lundin/mjukna)
[![gzip size](http://img.badgesize.io/https://unpkg.com/mjukna/dist/browser.js?compression=gzip&color=blue)](https://unpkg.com/mjukna/dist/browser.js)

Combines MutationObserver and FLIP-animations to automatically animate elements into new positions/sizes.

*WIP*

## Background

To ensure performant animations only `transform` and `opacity`.

This library solves the problem of translating whatever CSS or DOM changes you make into the equivalent CSS transforms. This enables performant animations paddings, margins, flex-properties and even the `display`-property performantly.


Takes advantage of the fact the you can make changes to the DOM, measure them and set new properties on elements before the anything is painted on screen.

Examples include:
 - List reordering
 - Transition to/from float
 - Shared element transitions
 - Animating flexbox properties(e.g. going from `flex-direction:` `row` to `column`)

This is not a library that tweens CSS-properties(we have plenty of those)

## Usage

The workflow is quite simple.:

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
});
```

#### Custom enter/exit animations



### Nested elements

Elements that contain other elements will be distorted...

```js
mjukna([...document.qierySelectorAll('.list-item, .list-item-header'])
```

### DEMOS (WIP)

 - [numbers](https://daniel-lundin.github.io/mjukna/numbers.html)
 - [guitars](https://daniel-lundin.github.io/mjukna/guitars.html)
 - [typography](https://daniel-lundin.github.io/mjukna/dictionary.html)
 - [list reordering](https://daniel-lundin.github.io/mjukna/list-reordering.html)


