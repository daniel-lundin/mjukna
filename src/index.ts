import { tween } from "./spring.js";
import { createMatrix } from "./matrix.js";
import { fadeIn, fadeOut } from "./presets.js";
// import { fadeIn, fadeOut } from "./presets.js";

const m = createMatrix();

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

interface DOMElement {
  getBoundingClientRect: () => Rect;
  style: {
    transform: string;
    willChange: string;
    position: string;
    width: string | number;
    height: string | number;
    top: string | number;
    left: string | number;
  };
  isConnected: boolean;
  parentElement: DOMElement;
  appendChild: (arg: DOMElement) => void;
  remove: () => void;
}

type ElementList = {
  element?: DOMElement;
  getElement?: () => DOMElement;
  anchor?: DOMElement;
  staggerBy?: number;
}[];

type DOMNodeList = DOMElement[];

interface Animation {
  execute: () => Promise<void>;
}

type Options = {
  stiffness?: number;
  damping?: number;
  noOvershoot?: boolean;
  initialVelocity?: number;
};

export default function mjukna(
  elementConfigs: ElementList | DOMNodeList,
  options: Options
): Animation {
  // Record previous positions
  const snapshots = [];
  for (let i = 0; i < elementConfigs.length; i++) {
    const elementConfig = elementConfigs[i];
    let previousPosition: Rect;
    let getElement: () => DOMElement;
    let previousParent: DOMElement = null;
    if ("getBoundingClientRect" in elementConfig) {
      previousParent = elementConfig.parentElement;
      previousPosition = elementConfig.getBoundingClientRect();
      getElement = () => elementConfig;
    } else if (elementConfig.anchor) {
      previousPosition = elementConfig.anchor.getBoundingClientRect();
      getElement = elementConfig.getElement;
    } else if (elementConfig.element) {
      previousPosition = elementConfig.element.getBoundingClientRect();
      previousParent = elementConfig.element.parentElement;
      getElement = () => elementConfig.element;
    } else {
      getElement = elementConfig.getElement;
    }
    const snapshot = {
      getElement,
      previousPosition,
      previousParent,
      staggerBy: "staggerBy" in elementConfig ? elementConfig.staggerBy : 0,
    };
    snapshots.push(snapshot);
  }

  return {
    async execute() {
      const animations = snapshots.map((snapshot) => {
        const element = snapshot.getElement();
        element.style.transform = "";
        const finalPosition = element.getBoundingClientRect();

        if (!snapshot.previousPosition) {
          return fadeIn(element, options);
        }
        if (!element.isConnected) {
          return exitAnimation(
            element,
            snapshot.previousPosition,
            snapshot.previousParent,
            options
          );
        }

        return FLIPScaleTranslate(
          element,
          snapshot.previousPosition,
          finalPosition,
          snapshot.staggerBy,
          options
        );
      });

      await Promise.all(animations);
    },
  };
}

async function exitAnimation(
  element: DOMElement,
  previousPosition: DOMRect,
  previousParent: DOMElement,
  options: Options
) {
  previousParent.appendChild(element);
  element.style.position = "absolute";
  element.style.width = `${previousPosition.width}px`;
  element.style.height = `${previousPosition.height}px`;
  element.style.top = 0;
  element.style.left = 0;

  const finalPosition = element.getBoundingClientRect();
  const xDiff = finalPosition.left - previousPosition.left;
  const yDiff = finalPosition.top - previousPosition.top;
  element.style.willChange = "transform, opacity";
  element.style.top = `${-yDiff}px`;
  element.style.left = `${-xDiff}px`;
  console.log(xDiff, yDiff);

  await fadeOut(element, options);
  element.remove();
}

function FLIPScaleTranslate(
  element: DOMElement,
  previousPosition: Rect,
  finalPosition: Rect,
  staggerBy: number,
  options: Options
): Promise<void> {
  // const { element, scale, previousPosition, finalPosition } = mjuk;
  const [scaleX, scaleY] = [
    previousPosition.width / finalPosition.width,
    previousPosition.height / finalPosition.height,
  ];
  const centerDiffX =
    previousPosition.left +
    previousPosition.width / 2 -
    (finalPosition.left + finalPosition.width / 2);

  const centerDiffY =
    previousPosition.top +
    previousPosition.height / 2 -
    (finalPosition.top + finalPosition.height / 2);

  element.style.willChange = "transform";
  element.style.transform = m
    .clear()
    .t(centerDiffX, centerDiffY)
    .s(scaleX, scaleY)
    .css();

  // await delay(staggerBy);
  // const [, previousBorderRadius] = /(\d*)(\w*)/.exec(mjuk.previousBorderRadius);
  // const [, currentBorderRadius, borderRadiusUnit] = /(\d*)(\w*)/.exec(
  //   mjuk.finalBorderRadius
  // );
  // element.style.borderRadius = `${
  //   previousBorderRadius / scale.x
  // }${borderRadiusUnit} / ${previousBorderRadius / scale.y}${borderRadiusUnit}`;
  // const animation = { element, staggerTimer: void 0, stopper: () => {} };
  // runningAnimations.push(animation);
  return new Promise((resolve) => {
    tween({
      from: [
        centerDiffX,
        centerDiffY,
        scaleX,
        scaleY,
        // Number(previousBorderRadius),
      ],
      to: [0, 0, 1, 1 /*Number(currentBorderRadius)*/],
      update([x, y, scaleX, scaleY /*, borderRadius*/]) {
        element.style.transform = m.clear().t(x, y).s(scaleX, scaleY).css();
        // if (borderRadius !== 0) {
        //   element.style.borderRadius = `${
        //     borderRadius / scaleX
        //   }${borderRadiusUnit} / ${
        //     borderRadius / scaleY
        //   }${borderRadiusUnit}`;
        // }
      },
      done() {
        element.style.transform = "";
        // element.style.borderRadius = mjuk.finalBorderRadius;
        resolve();
      },
      ...options,
    });
  });
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
