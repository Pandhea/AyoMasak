(() => {
  const STORAGE_KEY = 'ayoMasakAudioSettings';
  const DEFAULT_SETTINGS = { music: 28, effects: 70 };
  const musicSource = new URL('./AUD-20261024-WA0003.mp3', document.baseURI).href;
  const clickSource = new URL('./810763__mokasza__single-bubble-pop-01.mp3', document.baseURI).href;
  const embedded = window.parent !== window &&
    new URLSearchParams(window.location.search).get('embed') === '1';
  const homePage = document.body.classList.contains('page-home');
  const musicAudio = new Audio(musicSource);
  const clickAudio = new Audio(clickSource);
  musicAudio.loop = true;
  musicAudio.preload = 'auto';
  clickAudio.preload = 'auto';

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
    effectsGain = context.createGain();
    effectsGain.connect(context.destination);
    updateGains();
    return context;
  }

  function updateGains() {
    musicAudio.volume = settings.music / 100;
    clickAudio.volume = settings.effects / 100;
    if (context) {
      effectsGain.gain.setTargetAtTime(settings.effects / 100, context.currentTime, 0.04);
    }
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

  function startMusic() {
    if (!homePage) return;
    if (embedded) {
      window.parent.postMessage({ type: 'audio-start' }, window.location.origin);
      return;
    }

    if (musicStarted) return;
    musicStarted = true;
    musicAudio.play().catch(error => {
      musicStarted = false;
      if (error.name !== 'AbortError') {
        console.error('Gagal memutar musik latar.', error);
      }
    });
  }

  function stopMusic() {
    musicAudio.pause();
    musicAudio.currentTime = 0;
    musicStarted = false;
  }

  function playClick() {
    if (embedded) {
      window.parent.postMessage({ type: 'audio-click' }, window.location.origin);
      return;
    }

    clickAudio.currentTime = 0;
    clickAudio.play().catch(error => {
      console.error('Gagal memutar efek suara klik.', error);
    });
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

  function handleDocumentClick(event) {
    if (event.target instanceof Element && event.target.closest(
      'button, a, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]'
    )) {
      playClick();
    }
  }

  function handleStorage(event) {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    settings = normalizeSettings(JSON.parse(event.newValue));
    updateGains();
  }

  function dispose() {
    stopMusic();
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('pointerdown', startMusic, true);
    document.removeEventListener('keydown', startMusic, true);
    window.removeEventListener('storage', handleStorage);
  }

  window.AyoAudio = {
    getSettings: () => ({ ...settings }),
    setSettings,
    startMusic,
    stopMusic,
    dispose,
    playClick,
    playTone
  };

  document.addEventListener('click', handleDocumentClick);

  if (!embedded && homePage) {
    document.addEventListener('pointerdown', startMusic, { once: true, capture: true });
    document.addEventListener('keydown', startMusic, { once: true, capture: true });
  }
  if (!embedded) window.addEventListener('storage', handleStorage);
})();
