// Pequeño helper para reproducir beeps con Web Audio sin bloquear UI
// Incluye caché de AudioContext y límites básicos para evitar spam

let audioContext: AudioContext | null = null;
let lastPlayedAtNotification = 0;
let lastPlayedAtMessage = 0;
let lastPlayedAtBeep = 0;
let bellUrlCached: string | null = null;
let messageUrlCached: string | null = null;
let bellBuffer: AudioBuffer | null = null;
let bellBufferLoading: Promise<AudioBuffer | null> | null = null;
let messageBuffer: AudioBuffer | null = null;
let messageBufferLoading: Promise<AudioBuffer | null> | null = null;

function getContext(): AudioContext | null {
  try {
    if (!audioContext) {
      // @ts-ignore
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return null;
      audioContext = new Ctx();
    }
    return audioContext;
  } catch {
    return null;
  }
}

export function playBeep(options?: { frequency?: number; durationMs?: number; volume?: number }) {
  const now = Date.now();
  // Evitar avalancha de sonidos: mínimo 250ms entre beeps
  if (now - lastPlayedAtBeep < 250) return;
  lastPlayedAtBeep = now;

  const ctx = getContext();
  if (!ctx) return;

  const freq = options?.frequency ?? 880; // A5
  const dur = Math.max(50, Math.min(2000, options?.durationMs ?? 160));
  const vol = Math.max(0, Math.min(1, options?.volume ?? 0.2));

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = freq;
  gainNode.gain.value = vol;

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const startAt = ctx.currentTime;
  const endAt = startAt + dur / 1000;

  oscillator.start(startAt);
  // Fade out rápido para evitar clics
  gainNode.gain.setValueAtTime(vol, startAt);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);
  oscillator.stop(endAt);
}

function getConfiguredUrl(key: string, fallback: string): string {
  try {
    const envVal = (import.meta as any)?.env?.[key];
    if (envVal && typeof envVal === 'string') return envVal;
  } catch {}
  return fallback;
}

function shouldForceSynth(): boolean {
  try {
    const envVal = String((import.meta as any)?.env?.VITE_SOUND_FORCE_SYNTH || '').trim();
    if (envVal && envVal !== '0' && envVal.toLowerCase() !== 'false') return true;
  } catch {}
  try {
    const ls = localStorage.getItem('sound_force_synth');
    if (ls && ls !== '0' && ls.toLowerCase() !== 'false') return true;
  } catch {}
  return false;
}

async function fetchAudioBuffer(url: string): Promise<AudioBuffer | null> {
  const ctx = getContext();
  if (!ctx) return null;
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return await ctx.decodeAudioData(ab);
  } catch {
    return null;
  }
}

async function ensureBellBuffer(): Promise<AudioBuffer | null> {
  if (!bellUrlCached) bellUrlCached = getConfiguredUrl('VITE_NOTIFICATION_SOUND_URL', '/assets/sounds/bell.mp3');
  if (bellBuffer) return bellBuffer;
  if (!bellBufferLoading) bellBufferLoading = fetchAudioBuffer(bellUrlCached).then((b) => (bellBuffer = b));
  return bellBufferLoading;
}

async function ensureMessageBuffer(): Promise<AudioBuffer | null> {
  if (!messageUrlCached) messageUrlCached = getConfiguredUrl('VITE_MESSAGE_SOUND_URL', '/assets/sounds/message.mp3');
  if (messageBuffer) return messageBuffer;
  if (!messageBufferLoading) messageBufferLoading = fetchAudioBuffer(messageUrlCached).then((b) => (messageBuffer = b));
  return messageBufferLoading;
}

function playBuffer(buffer: AudioBuffer, volume: number) {
  const ctx = getContext();
  if (!ctx) return false;
  try {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume));
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    return true;
  } catch {
    return false;
  }
}

function getBellElement(): HTMLAudioElement | null {
  try {
    if (!bellUrlCached) {
      bellUrlCached = getConfiguredUrl('VITE_NOTIFICATION_SOUND_URL', '/assets/sounds/bell.mp3');
    }
    const el = new Audio(bellUrlCached);
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    el.volume = 0.85;
    return el;
  } catch {
    return null;
  }
}

function getMessageElement(): HTMLAudioElement | null {
  try {
    if (!messageUrlCached) {
      messageUrlCached = getConfiguredUrl('VITE_MESSAGE_SOUND_URL', '/assets/sounds/message.mp3');
    }
    const el = new Audio(messageUrlCached);
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    el.volume = 0.75;
    return el;
  } catch {
    return null;
  }
}

async function tryPlayWithFallback(el: HTMLAudioElement | null, volume: number, synthFallback: () => void, waitMs = 350): Promise<void> {
  if (!el) {
    synthFallback();
    return;
  }
  try {
    el.volume = Math.max(0, Math.min(1, volume));
    try { el.currentTime = 0; } catch {}
    let didStart = false;
    const onPlaying = () => { didStart = true; cleanup(); };
    const onTimeUpdate = () => { if (!el.paused && el.currentTime > 0) { didStart = true; cleanup(); } };
    const onError = () => { if (!didStart) { cleanup(); synthFallback(); } };
    const cleanup = () => {
      try { el.removeEventListener('playing', onPlaying); } catch {}
      try { el.removeEventListener('timeupdate', onTimeUpdate); } catch {}
      try { el.removeEventListener('error', onError); } catch {}
    };
    el.addEventListener('playing', onPlaying, { once: true } as any);
    el.addEventListener('timeupdate', onTimeUpdate as any);
    el.addEventListener('error', onError as any, { once: true } as any);
    const t = setTimeout(() => { if (!didStart) { cleanup(); synthFallback(); } }, waitMs);
    try { await el.play(); } catch { clearTimeout(t); cleanup(); synthFallback(); return; }
  } catch { synthFallback(); }
}

export function playNotificationChime() {
  const now = Date.now();
  if (now - lastPlayedAtNotification < 250) return;
  lastPlayedAtNotification = now;
  // Asegurar audio habilitado incluso si el llamador no lo hizo
  resumeAudioIfNeeded();

  if (shouldForceSynth()) {
    // Forzar campana sintetizada
    const ctx = getContext();
    if (!ctx) { playBeep({ frequency: 784, durationMs: 200, volume: 0.32 }); return; }
    const startAt = ctx.currentTime + 0.01;
    const totalMs = 1200;
    const endAt = startAt + totalMs / 1000;
    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    const partials = [ { f: 784, a: 1.0 }, { f: 1176, a: 0.55 }, { f: 1568, a: 0.35 }, { f: 2093, a: 0.22 } ];
    partials.forEach((p, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = p.f;
      osc.detune.value = (idx % 2 === 0 ? 1 : -1) * 6;
      g.gain.setValueAtTime(0.0001, startAt);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, p.a), startAt + 0.03);
      const decay = endAt - (startAt + 0.03);
      const partialEnd = startAt + 0.03 + decay * (0.7 - idx * 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, Math.max(startAt + 0.12, Math.min(partialEnd, endAt)));
      osc.connect(g); g.connect(master);
      osc.start(startAt); osc.stop(endAt);
    });
    const echoDelay = 0.18; const echoGain = ctx.createGain(); echoGain.gain.value = 0.22; echoGain.connect(ctx.destination);
    [784, 1176, 1568].forEach((f, idx) => { const osc = ctx.createOscillator(); const g = ctx.createGain(); osc.type = 'sine'; osc.frequency.value = f * 0.995; osc.detune.value = (idx % 2 === 0 ? -1 : 1) * 4; const s = startAt + echoDelay; const e = s + 0.7; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.18 - idx * 0.04, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, e); osc.connect(g); g.connect(echoGain); osc.start(s); osc.stop(e); });
    return;
  }

  // Intento 1: si ya tenemos buffer, reproducirlo ahora
  if (bellBuffer && playBuffer(bellBuffer, 0.9)) return;
  // Intento 2: iniciar carga en background y fallback inmediato al sintetizado
  ensureBellBuffer();
  {
    const ctx = getContext();
    if (!ctx) return;
    const startAt = ctx.currentTime + 0.01;
    const totalMs = 1200;
    const endAt = startAt + totalMs / 1000;
    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    const partials = [ { f: 784, a: 1.0 }, { f: 1176, a: 0.55 }, { f: 1568, a: 0.35 }, { f: 2093, a: 0.22 } ];
    partials.forEach((p, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = p.f;
      osc.detune.value = (idx % 2 === 0 ? 1 : -1) * 6;
      g.gain.setValueAtTime(0.0001, startAt);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, p.a), startAt + 0.03);
      const decay = endAt - (startAt + 0.03);
      const partialEnd = startAt + 0.03 + decay * (0.7 - idx * 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, Math.max(startAt + 0.12, Math.min(partialEnd, endAt)));
      osc.connect(g); g.connect(master);
      osc.start(startAt); osc.stop(endAt);
    });
    const echoDelay = 0.18; const echoGain = ctx.createGain(); echoGain.gain.value = 0.22; echoGain.connect(ctx.destination);
    [784, 1176, 1568].forEach((f, idx) => { const osc = ctx.createOscillator(); const g = ctx.createGain(); osc.type = 'sine'; osc.frequency.value = f * 0.995; osc.detune.value = (idx % 2 === 0 ? -1 : 1) * 4; const s = startAt + echoDelay; const e = s + 0.7; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.18 - idx * 0.04, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, e); osc.connect(g); g.connect(echoGain); osc.start(s); osc.stop(e); });
  }
}

export function playMessageTone() {
  const now = Date.now();
  if (now - lastPlayedAtMessage < 200) return;
  lastPlayedAtMessage = now;
  resumeAudioIfNeeded();
  if (shouldForceSynth()) { playBeep({ frequency: 660, durationMs: 220, volume: 0.34 }); return; }
  // Intentar sonido de mensaje; si no existe, usar campana; luego caer al sintetizado
  const elMsg = getMessageElement();
  const elBell = getBellElement();
  const tryBell = () => tryPlayWithFallback(elBell, 0.85, () => playBeep({ frequency: 660, durationMs: 220, volume: 0.34 }), 300);
  tryPlayWithFallback(elMsg, 0.8, tryBell, 300);
}

export function resumeAudioIfNeeded() {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

export function warmupAudioElements() {
  try {
    resumeAudioIfNeeded();
    const bell = getBellElement();
    if (bell) {
      bell.muted = true;
      const prevVol = bell.volume;
      bell.volume = 0;
      bell.play().then(() => {
        try { bell.pause(); bell.currentTime = 0; } catch {}
        bell.muted = false;
        bell.volume = prevVol;
      }).catch(() => { try { bell.muted = false; bell.volume = prevVol; } catch {} });
    }
    const msg = getMessageElement();
    if (msg) {
      msg.muted = true;
      const prevVolM = msg.volume;
      msg.volume = 0;
      msg.play().then(() => {
        try { msg.pause(); msg.currentTime = 0; } catch {}
        msg.muted = false;
        msg.volume = prevVolM;
      }).catch(() => { try { msg.muted = false; msg.volume = prevVolM; } catch {} });
    }
  } catch {}
}


