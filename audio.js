(() => {
  const STORAGE_KEY = 'ayoMasakAudioSettings';
  const DEFAULT_SETTINGS = { music: 28, effects: 70 };
  const embedded = window.parent !== window &&
    new URLSearchParams(window.location.search).get('embed') === '1';

  function normalizeSettings(value) {
    const music = Number(value?.music ?? DEFAULT_SETTINGS.music);
    const effects = Number(value?.effects ?? DEFAULT_SETTINGS.effects);
    return {
      music: Math.round(Math.min(100, Math.max(0, Number.isFinite(music) ? music : DEFAULT_SETTINGS.music))),
      effects: Math.round(Math.min(100, Math.max(0, Number.isFinite(effects) ? effects : DEFAULT_SETTINGS.effects)))
    };
  }

  function loadSettings() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_SETTINGS };
    try {
      return normalizeSettings(JSON.parse(stored));
    } catch (error) {
      console.warn('Pengaturan audio tersimpan tidak valid; menggunakan nilai default.', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  let settings = loadSettings();
  let context = null;
  let musicGain = null;
  let effectsGain = null;
  let musicStarted = false;

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function getAudioContext() {
    if (context) return context;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return null;

    context = new AudioContextConstructor();
    musicGain = context.createGain();
    effectsGain = context.createGain();
    musicGain.connect(context.destination);
    effectsGain.connect(context.destination);
    updateGains();
    return context;
  }

  function updateGains() {
    if (!context) return;
    musicGain.gain.setTargetAtTime(settings.music / 100 * 0.3, context.currentTime, 0.04);
    effectsGain.gain.setTargetAtTime(settings.effects / 100, context.currentTime, 0.04);
  }

  function scheduleNote(frequency, startTime, duration, waveform, level, destination) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.exponentialRampToValueAtTime(level, startTime + 0.04);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  function playMusicLoop() {
    if (!context || !musicStarted) return;

    const startTime = context.currentTime + 0.08;
    const chords = [
      [130.81, 164.81, 196],
      [110, 130.81, 164.81],
      [87.31, 110, 130.81],
      [98, 123.47, 146.83]
    ];
    const melody = [
      523.25, 587.33, 659.25, 587.33,
      523.25, 392, 440, 523.25,
      587.33, 659.25, 783.99, 659.25,
      587.33, 523.25, 440, 392
    ];

    chords.forEach((chord, bar) => {
      const barStart = startTime + bar * 2;
      chord.forEach(frequency => scheduleNote(frequency, barStart, 1.9, 'sine', 0.12, musicGain));
    });
    melody.forEach((frequency, beat) => {
      scheduleNote(frequency, startTime + beat * 0.5, 0.32, 'triangle', 0.16, musicGain);
    });

    window.setTimeout(playMusicLoop, 7900);
  }

  function startMusic() {
    if (embedded) {
      window.parent.postMessage({ type: 'audio-start' }, window.location.origin);
      return;
    }

    const audioContext = getAudioContext();
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    if (musicStarted) return;
    musicStarted = true;
    playMusicLoop();
  }

  function setSettings(nextSettings) {
    settings = normalizeSettings({ ...settings, ...nextSettings });
    saveSettings();
    updateGains();
    if (embedded) {
      window.parent.postMessage({ type: 'audio-settings', settings }, window.location.origin);
    }
    return { ...settings };
  }

  function playTone(frequency, duration, volume = 0.04) {
    if (embedded) {
      window.parent.postMessage({
        type: 'audio-tone',
        frequency,
        duration,
        volume
      }, window.location.origin);
      return;
    }

    const audioContext = getAudioContext();
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    envelope.gain.value = volume;
    oscillator.connect(envelope);
    envelope.connect(effectsGain);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }

  window.AyoAudio = {
    getSettings: () => ({ ...settings }),
    setSettings,
    startMusic,
    playTone
  };

  if (!embedded) {
    document.addEventListener('pointerdown', startMusic, { once: true, capture: true });
    document.addEventListener('keydown', startMusic, { once: true, capture: true });
    window.addEventListener('storage', event => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      settings = normalizeSettings(JSON.parse(event.newValue));
      updateGains();
    });
  }
})();
