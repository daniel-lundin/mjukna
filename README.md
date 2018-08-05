# mjukna

[![Build Status](https://travis-ci.org/daniel-lundin/mjukna.svg?branch=master)](https://travis-ci.org/daniel-lundin/mjukna)
[![gzip size](http://img.badgesize.io/https://unpkg.com/mjukna/dist/browser.js?compression=gzip&color=blue)](https://unpkg.com/mjukna/dist/browser.js)

Library for animating layout changes perfomantly using the [FLIP technique](https://aerotwist.com/blog/flip-your-animations/)

Use cases:

 - List reordering
 - DOM node additions/removals
 - Shared element transitions
 - Animating "unanimatable" CSS properties(e.g. `display`, `flex-direction`, `grid-template-rows`)

Highlights:

 - Smallish footprint(~2kB gzipped)
 - Handles nested DOM structures by compensation for parent transforms
 - Automatically detects DOM changes by leveraging [MutationObservers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## Installation

NPM:
`npm install mjukna`

CDN:
 - https://cdn.jsdelivr.net/npm/mjukna/dist/browser.js
 - https://unpkg.com/mjukna@0.3.0/dist/browser.js 

## Basic usage

```js
// Register all list items
mjukna(document.querySelectorAll('li'));

// Remove the first one one
document.querySelector('li').remove();
```

Will result in:

![basic usage](assets/basic.gif)

## API


## Shared element transitions

TBD

![shared usage](assets/anchoring.gif)

### Nested elements

Elements that contain other elements will be distorted...

```js
mjukna(document.querySelectorAll('.list-item, .list-item-header')
```

### DEMOS (WIP)

 - [Shared element transition(basic)](https://daniel-lundin.github.io/mjukna/anchor.html)
 - [Shared element transition(advanced)](https://daniel-lundin.github.io/mjukna/guitars.html)
 - [Grid animations](https://daniel-lundin.github.io/mjukna/numbers.html)
 - [typography](https://daniel-lundin.github.io/mjukna/dictionary.html)
 - [list reordering](https://daniel-lundin.github.io/mjukna/list-reordering.html)


