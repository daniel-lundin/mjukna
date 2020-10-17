function tweenArray(from, to, output, tweenValue) {
  from.forEach((value, i) => {
    output[i] = value + (to[i] - value) * tweenValue; // eslint-disable-line
  });
}

function springTween(config, rAF) {
  const stiffness = config.stiffness || 10;
  const damping = config.damping || 0.5;
  const noOvershoot = !!config.noOvershoot;
  let velocity = config.velocity || 0;

  const { from, to } = config;
  const output = [...config.from];

  let tweenValue = 0;

  const tick = () => {
    if (rAF.isStopped()) return;

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

export function tween(config) {
  // eslint-disable-line consistent-return
  const stopper = { stopped: false };
  const showStopper = () => {
    stopper.stopped = true;
  };
  const rAF = (cb) => {
    if (!stopper.stopped) {
      window.requestAnimationFrame(cb);
    }
  };
  rAF.isStopped = () => stopper.stopped;
  springTween(config, rAF);
  return showStopper;
}
