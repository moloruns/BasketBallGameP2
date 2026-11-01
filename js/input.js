// Selectable input adapts gestures to the inherited two-step shot flow.
const ShotInput = (() => {
  let mode = 'click';
  let held = null;
  let onShot;
  const hints = {
    click: 'Click to charge · Click again near the white line',
    'mouse-hold': 'Hold LMB to charge · Release near the white line',
    'space-hold': 'Hold Space to charge · Release near the white line',
  };

  function reset() { held = null; }
  function setMode(value) { mode = Object.hasOwn(hints, value) ? value : 'click'; reset(); }

  function press(source) {
    if (!GameState.isPlaying()) return;
    if (mode === 'click') {
      if (source === 'mouse') onShot();
      return;
    }
    if (source !== (mode === 'mouse-hold' ? 'mouse' : 'space') || held || Meter.isActive()) return;
    onShot();
    if (Meter.isActive()) held = source;
  }

  function release(source) {
    if (held !== source) return;
    held = null;
    // A full meter may already have auto-missed. Release must not start a new shot.
    if (GameState.isPlaying() && Meter.isActive()) onShot();
  }

  function cancelHold() {
    if (!held) return;
    reset();
    Meter.cancel();
    Player.setFrozen(false);
  }

  function attach(callback) {
    onShot = callback;
    // Window-level release also works when the pointer leaves the court.
    window.addEventListener('mouseup', event => { if (event.button === 0) release('mouse'); });
    window.addEventListener('keydown', event => {
      if (event.code !== 'Space' || mode !== 'space-hold' || !GameState.isPlaying()) return;
      if (event.target instanceof Element && event.target.closest('button, select, input, textarea, [contenteditable]')) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      if (!event.repeat) press('space');
    });
    window.addEventListener('keyup', event => {
      if (event.code !== 'Space' || held !== 'space') return;
      event.preventDefault();
      release('space');
    });
    window.addEventListener('blur', cancelHold);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelHold(); });
  }

  return { attach, press, reset, setMode, get mode() { return mode; }, get hint() { return hints[mode]; } };
})();
