function tweenArray(
  from: number[],
  to: number[],
  output: number[],
  tweenValue: number
) {
  from.forEach((value, i) => {
    output[i] = value + (to[i] - value) * tweenValue;
  });
}

type Config = {
  from: number[];
  to: number[];
  stiffness?: number;
  damping?: number;
  noOvershoot?: boolean;
  velocity?: number;
  update: (arg0: number[]) => void;
  done?: () => void;
};

type StoppableRAF = (cb: () => void) => void;

function springTween(
  config: Config,
  rAF: StoppableRAF,
  isStopped: () => boolean
) {
  const stiffness = config.stiffness || 10;
  const damping = config.damping || 0.5;
  const noOvershoot = !!config.noOvershoot;
  let velocity = config.velocity || 0;

  const { from, to } = config;
  const output = [...config.from];

  let tweenValue = 0;

  const tick = () => {
    if (isStopped()) return;

    const diff = 1 - tweenValue;
    const acceleration = diff * (stiffness / 100) - velocity * damping;

    velocity += acceleration;
    tweenValue += velocity;

    if (noOvershoot && tweenValue > 1) {
      velocity *= -1;
      tweenValue = 1 - (tweenValue - 1);
    }

    if (Math.abs(tweenValue - 1) < 0.001 && Math.abs(velocity) < 0.001) {
      tweenArray(from, to, output, 1);
      config.update(to);
      if (config.done) {
        config.done();
      }
      return;
    }

    tweenArray(from, to, output, tweenValue);
    config.update(output);
    rAF(tick);
  };
  rAF(tick);
}

export function tween(config: Config) {
  // eslint-disable-line consistent-return
  const stopper = { stopped: false };
  const showStopper = () => {
    stopper.stopped = true;
  };
  const rAF = (cb: () => void) => {
    if (!stopper.stopped) {
      window.requestAnimationFrame(cb);
    }
  };
  const isStopped = () => stopper.stopped;
  springTween(config, rAF, isStopped);
  return showStopper;
}
