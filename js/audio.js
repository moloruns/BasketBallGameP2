// Optional, local synthesized effects. No audio failure is allowed to interrupt play.
const Sound = (() => {
  let context = null;
  let master = null;
  let muted = false;
  const voices = new Set();

  function unlock() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!context) {
        context = new AudioContextClass();
        master = context.createGain();
        master.gain.value = muted ? 0 : .12;
        master.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch (_) { /* Continue silently if audio is blocked or unavailable. */ }
  }

  function stopAll() {
    for (const voice of voices) { try { voice.stop(); } catch (_) {} }
    voices.clear();
  }

  function setMuted(value) {
    muted = !!value;
    if (muted) stopAll();
    try { if (master) master.gain.value = muted ? 0 : .12; } catch (_) {}
    return muted;
  }

  function tone(frequency, endFrequency, delay, duration, type = 'sine') {
    if (!context || context.state !== 'running' || muted || !master) return;
    try {
      if (voices.size >= 12) { const oldest = voices.values().next().value; oldest.stop(); voices.delete(oldest); }
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const at = context.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(.5, at + .008);
      envelope.gain.exponentialRampToValueAtTime(.001, at + duration);
      oscillator.connect(envelope); envelope.connect(master);
      voices.add(oscillator);
      oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(at); oscillator.stop(at + duration + .01);
    } catch (_) { /* An unsupported effect is cosmetic. */ }
  }

  function play(kind) {
    if (kind === 'release') tone(280, 500, 0, .07);
    if (kind === 'make') { tone(660, 700, 0, .12); tone(990, 1100, .08, .16); }
    if (kind === 'miss') tone(190, 95, 0, .16, 'triangle');
    if (kind === 'buzzer') tone(120, 90, 0, .35, 'sawtooth');
  }

  return { unlock, play, stopAll, setMuted, get muted() { return muted; } };
})();
