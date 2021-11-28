import { tween } from "./spring.js";
import { createMatrix } from "./matrix.js";
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
  };
}
type ElementList = {
  element?: DOMElement;
  getElement?: () => DOMElement;
  anchor?: DOMElement;
  staggerBy?: number;
}[];

interface Animation {
  snapshots: {
    getElement: () => DOMElement;
    previousPosition: Rect;
  }[];
  execute: () => Promise<void>;
}

type Options = {
  stiffness?: number;
  damping?: number;
  noOvershoot?: boolean;
  initialVelocity?: number;
};

export default function mjukna(
  elementConfigs: ElementList,
  options: Options
): Animation {
  // Record previous positions
  const snapshots = [];
  for (const elementConfig of elementConfigs) {
    let previousPosition: Rect;
    let getElement: () => DOMElement;
    if (elementConfig.anchor) {
      previousPosition = elementConfig.anchor.getBoundingClientRect();
      getElement = elementConfig.getElement;
    } else if (elementConfig.element) {
      previousPosition = elementConfig.element.getBoundingClientRect();
      getElement = () => elementConfig.element;
    }
    const snapshot = {
      getElement,
      previousPosition,
    };
    snapshots.push(snapshot);
  }

  console.log("snapshots", snapshots, elementConfigs);

  return {
    snapshots,
    execute() {
      console.log("executing", snapshots);
      this.snapshots.forEach((snapshot) => {
        const element = snapshot.getElement();
        element.style.transform = "";
        const finalPosition = element.getBoundingClientRect();

        console.log("finalPosition", finalPosition, element);
        FLIPScaleTranslate(
          element,
          snapshot.previousPosition,
          finalPosition,
          options
        );
      });

      return Promise.resolve();
    },
  };
}

function FLIPScaleTranslate(
  element: DOMElement,
  previousPosition: Rect,
  finalPosition: Rect,
  options: Options
) {
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
