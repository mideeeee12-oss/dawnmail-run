// Dawnmail Run — keyboard and pointer input. state.js reads `keys`;
// main.js registers what a click or Enter means on each screen.

const FGInput = (() => {
  const keys = { left: false, right: false, up: false, down: false, faster: false, slower: false };
  let onTap = null;
  let onMute = null;

  const KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'up', KeyW: 'faster',
    ArrowDown: 'down', KeyS: 'slower',
  };

  // W both climbs (with the arrows' pitch) and adds throttle; read pitch from
  // the arrow keys only, so KEYMAP keeps W/S purely on the throttle.
  function bind(canvas) {
    window.addEventListener('keydown', e => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat && onTap) onTap();
        return;
      }
      if (e.code === 'KeyM') { if (!e.repeat && onMute) onMute(); return; }
      const k = KEYMAP[e.code];
      if (k) { keys[k] = true; e.preventDefault(); }
      if (e.code === 'KeyW') keys.up = true;
      if (e.code === 'KeyS') keys.down = true;
    });
    window.addEventListener('keyup', e => {
      const k = KEYMAP[e.code];
      if (k) keys[k] = false;
      if (e.code === 'KeyW') keys.up = false;
      if (e.code === 'KeyS') keys.down = false;
    });
    canvas.addEventListener('pointerdown', () => { if (onTap) onTap(); });
  }

  return {
    keys,
    bind,
    setTapHandler(fn) { onTap = fn; },
    setMuteHandler(fn) { onMute = fn; },
  };
})();
