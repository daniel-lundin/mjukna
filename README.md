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

### ```mjukna(element(s), options)```

#### Element

Type: `Element` | iterable of `Element`s | Array of objects


#### Options

Type: `object`

 - `staggerBy` - `Number` in milliseconds to delay each element with
 - `enterFilter` - predicate `function` that gets called for each element added to the DOM. Return `true` to run enter animation.
 - `enterAnimation` - Hook to run custom enter animations. The provided function will be called with to arguments, the element and a done callback.
 - `exitAnimation` - Same as `enterAnimation` but for removed DOM nodes
 - `spring` - Parameters for the spring physics

Example including all available options:
```js
{
  staggerBy: 20,
  enterFilter: (element) => element.classList.contains('list-item'),
  enterAnimation: (element, done) => externalLibFadeIn(element).then(done),
  exitAnimation:(element, done) => externalLibFadeOut(element).then(done),
  spring: {
    stiffness: 10,
    damping: 0.5
  }
}
```

## Shared element transitions

When an element enters the DOM, an anchor element can be set as the origin for element. The added element will be transformed to the same size/position as the anchor element and then animated to its normal position.

As an example, making a modal expand from a button might look something like this:

```js
mjukna({
  anchor: document.querySelector('modal-button'),
  element: () => document.querySelector('modal')
})

const modal = document.createElement('div');
modal.classList.add('modal');
document.body.appendChild(modal);
```

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
 - [Typography](https://daniel-lundin.github.io/mjukna/dictionary.html)
 - [List reordering](https://daniel-lundin.github.io/mjukna/list-reordering.html)


