export function tweenArray(from, to, output, tweenValue) {
  from.forEach((value, i) => {
    if (Array.isArray(value)) {
      tweenArray(value, to[i], output[i], tweenValue);
    } else {
      output[i] = value + (to[i] - value) * tweenValue; // eslint-disable-line
    }
  });
}

function deepClone(sequence) {
  return sequence.map(item => {
    if (Array.isArray(item)) {
      return deepClone(item);
    }
    return item;
  });
}

export function springTween(config, rAF) {
  const tension = config.tension || 0.8;
  const deceleration = config.deceleration || 0.8;
  const friction = config.friction || 1;
  let velocity = config.initialVelocity || 0;

  const { from, to } = config;
  const output = deepClone(config.from);

  let tweenValue = 0;

  const tick = () => {
    if (rAF.isStopped()) return;

    const diff = 1 - tweenValue;
    const force = diff * tension;
    const acc = force * friction;

    velocity += acc;
    velocity *= deceleration;

    tweenValue += velocity;

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
  const rAF = cb => {
    if (!stopper.stopped) {
      window.requestAnimationFrame(cb);
    }
  };
  rAF.isStopped = () => stopper.stopped;

  if (!config.easer) {
    springTween(config, rAF);
    return showStopper;
  }

  const { from, to, easer } = config;
  const duration = config.duration || 500;

  const output = deepClone(config.from);

  let currentTime = null;

  function tick(time) {
    if (rAF.isStopped()) return;

    if (!currentTime) {
      currentTime = time;
    }
    const normalizedTime = (time - currentTime) / duration;
    const tweenValue = easer(normalizedTime);

    if (time - currentTime >= duration) {
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
  }

  rAF(tick);
  return showStopper;
}
