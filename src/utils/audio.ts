import { SoundMode } from '../types';

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private soundMode: SoundMode = 'ALL';
  private bgmTimer: number | null = null;
  private isBgmPlaying = false;
  private currentNoteIndex = 0;
  private isTurboBgm = false;

  // Vintage 8-bit chiptune notes (frequencies in Hz)
  // Catchy arcade retro melody loop
  private readonly melody = [
    { freq: 440.0, dur: 0.14 }, // A4
    { freq: 0, dur: 0.05 },     // rest
    { freq: 523.25, dur: 0.14 },// C5
    { freq: 587.33, dur: 0.14 },// D5
    { freq: 659.25, dur: 0.22 },// E5
    { freq: 587.33, dur: 0.14 },// D5
    { freq: 523.25, dur: 0.14 },// C5
    { freq: 440.0, dur: 0.28 }, // A4
    { freq: 392.0, dur: 0.14 }, // G4
    { freq: 440.0, dur: 0.14 }, // A4
    { freq: 523.25, dur: 0.24 },// C5
    { freq: 392.0, dur: 0.18 }, // G4
    { freq: 329.63, dur: 0.32 },// E4
    { freq: 0, dur: 0.08 },     // rest

    { freq: 440.0, dur: 0.14 }, // A4
    { freq: 523.25, dur: 0.14 },// C5
    { freq: 659.25, dur: 0.14 },// E5
    { freq: 783.99, dur: 0.26 },// G5
    { freq: 659.25, dur: 0.14 },// E5
    { freq: 587.33, dur: 0.22 },// D5
    { freq: 523.25, dur: 0.14 },// C5
    { freq: 587.33, dur: 0.14 },// D5
    { freq: 659.25, dur: 0.28 },// E5
    { freq: 523.25, dur: 0.16 },// C5
    { freq: 440.0, dur: 0.38 }, // A4
    { freq: 0, dur: 0.12 },     // rest
  ];

  constructor() {
    // Lazy init on first user action
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundMode(mode: SoundMode) {
    this.soundMode = mode;
    this.initContext();

    if (mode === 'MUTE') {
      this.stopBgm();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else if (mode === 'SFX_ONLY') {
      this.stopBgm();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      }
    } else {
      // ALL
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      }
      if (this.isBgmPlaying) {
        this.startBgm();
      }
    }
  }

  public getSoundMode(): SoundMode {
    return this.soundMode;
  }

  // Play a simple custom square/pulse tone
  private playTone(freq: number, duration: number, type: OscillatorType = 'square', gainVal = 0.3) {
    if (this.soundMode === 'MUTE') return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(noteGain);
      noteGain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio error if context suspended
    }
  }

  public playButton() {
    this.playTone(780, 0.04, 'square', 0.25);
  }

  public playMoveTick() {
    if (this.soundMode === 'MUTE') return;
    // Tiny subtle tactile pop
    this.playTone(280, 0.015, 'triangle', 0.12);
  }

  public playEatFruit() {
    if (this.soundMode === 'MUTE') return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.0, now + 0.05); // A5

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio error ignored
    }
  }

  public playEatInsect() {
    if (this.soundMode === 'MUTE') return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
      const noteDuration = 0.045;
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

        gain.gain.setValueAtTime(0.4, now + idx * noteDuration);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * noteDuration);
        osc.stop(now + (idx + 1) * noteDuration);
      });
    } catch {
      // Audio error ignored
    }
  }

  public playSpeedBoost() {
    if (this.soundMode === 'MUTE') return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio error ignored
    }
  }

  public playCrash() {
    if (this.soundMode === 'MUTE') return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;

      // Low square drop
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.35);

      // Noise burst for crunch
      const bufferSize = this.ctx.sampleRate * 0.25;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.25);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.25);
    } catch {
      // Audio error ignored
    }
  }

  public playGameOver() {
    if (this.soundMode === 'MUTE') return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const notes = [392.0, 370.0, 349.23, 311.13, 293.66]; // Sad Nokia descent
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + i * 0.12;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(time);
        osc.stop(time + 0.12);
      });
    } catch {
      // Audio error ignored
    }
  }

  public playNewHighScore() {
    if (this.soundMode === 'MUTE') return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      // Celebratory arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + i * 0.08;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + (i === notes.length - 1 ? 0.35 : 0.08));

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(time);
        osc.stop(time + (i === notes.length - 1 ? 0.35 : 0.08));
      });
    } catch {
      // Audio error ignored
    }
  }

  public playLowBatteryAlert() {
    if (this.soundMode === 'MUTE') return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Authentic vintage Nokia low-battery double-beep (high tone, then lower tone)
      const tones = [
        { freq: 659.25, start: 0, dur: 0.07 },
        { freq: 523.25, start: 0.1, dur: 0.08 },
      ];

      tones.forEach((t) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(t.freq, now + t.start);

        gain.gain.setValueAtTime(0.3, now + t.start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur);
      });
    } catch {
      // Audio error ignored
    }
  }

  // Chiptune background music loop
  public startBgm() {
    this.isBgmPlaying = true;
    if (this.soundMode !== 'ALL') return;
    this.initContext();
    this.scheduleNextBgmNote();
  }

  public stopBgm() {
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public setTurboBgm(turbo: boolean) {
    this.isTurboBgm = turbo;
  }

  private scheduleNextBgmNote() {
    if (!this.isBgmPlaying || this.soundMode !== 'ALL') return;
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    const note = this.melody[this.currentNoteIndex];
    const speedMult = this.isTurboBgm ? 0.7 : 1.0;
    const dur = note.dur * speedMult;

    if (note.freq > 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // If turbo, shift pitch slightly up for intensity
        const freq = this.isTurboBgm ? note.freq * 1.15 : note.freq;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur * 0.95);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + dur);
      } catch {
        // Fallback
      }
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
    this.bgmTimer = window.setTimeout(() => {
      this.scheduleNextBgmNote();
    }, dur * 1000);
  }
}

export const audio = new RetroAudioEngine();
