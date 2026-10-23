/**
 * WildlifeAudioSynthesizer
 * Generator suara satwa alami berbasis Web Audio API
 * Digunakan sebagai generator audio instan untuk satwa Ragunan Zoo saat file audio eksternal belum tersedia.
 */

export type WildlifeSoundType = 'tiger' | 'lion' | 'elephant' | 'bird' | 'primate' | 'bear' | 'reptile' | 'default';

class WildlifeAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private currentSourceNodes: { stop: () => void }[] = [];
  private isPlaying: boolean = false;

  private getContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public detectSoundType(animalName: string): WildlifeSoundType {
    const name = animalName.toLowerCase();
    if (name.includes('harimau') || name.includes('macan') || name.includes('tiger')) return 'tiger';
    if (name.includes('singa') || name.includes('lion')) return 'lion';
    if (name.includes('gajah') || name.includes('elephant')) return 'elephant';
    if (name.includes('burung') || name.includes('elang') || name.includes('cenderawasih') || name.includes('bird')) return 'bird';
    if (name.includes('orangutan') || name.includes('bekantan') || name.includes('monyet') || name.includes('kera') || name.includes('primata')) return 'primate';
    if (name.includes('beruang') || name.includes('bear')) return 'bear';
    if (name.includes('komodo') || name.includes('buaya') || name.includes('ular') || name.includes('reptil')) return 'reptile';
    return 'default';
  }

  /**
   * Menghentikan semua pemutaran suara yang sedang aktif
   */
  public stopAll() {
    this.currentSourceNodes.forEach(node => {
      try {
        node.stop();
      } catch (_e) {
        // Node already stopped or inactive
      }
    });
    this.currentSourceNodes = [];
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Memainkan simulasi suara satwa alami berdasarkan jenis satwa
   */
  public playAnimalSound(type: WildlifeSoundType, onEnded?: () => void): { stop: () => void; analyser: AnalyserNode } {
    this.stopAll();
    const ctx = this.getContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(ctx.destination);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime);
    masterGain.connect(analyser);

    this.isPlaying = true;
    let duration = 2.5;

    switch (type) {
      case 'tiger':
      case 'lion':
        duration = this.playBigCatRoar(ctx, masterGain, type === 'lion');
        break;
      case 'elephant':
        duration = this.playElephantTrumpet(ctx, masterGain);
        break;
      case 'bird':
        duration = this.playBirdSong(ctx, masterGain);
        break;
      case 'primate':
        duration = this.playPrimateCall(ctx, masterGain);
        break;
      case 'bear':
        duration = this.playBearGrowl(ctx, masterGain);
        break;
      case 'reptile':
        duration = this.playReptileHiss(ctx, masterGain);
        break;
      default:
        duration = this.playNatureCall(ctx, masterGain);
        break;
    }

    const timer = setTimeout(() => {
      this.isPlaying = false;
      if (onEnded) onEnded();
    }, duration * 1000);

    const stopper = {
      stop: () => {
        clearTimeout(timer);
        this.stopAll();
        if (onEnded) onEnded();
      },
      analyser,
    };

    return stopper;
  }

  /**
   * Harimau / Singa: Resonansi geraman berat dan auman rendah
   */
  private playBigCatRoar(ctx: AudioContext, dest: GainNode, isLion: boolean): number {
    const duration = 2.8;
    const now = ctx.currentTime;

    // 1. Noise Generator untuk tekstur auman parau
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Filter bandpass untuk karakter rongga mulut predator
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isLion ? 140 : 180, now);
    filter.frequency.exponentialRampToValueAtTime(isLion ? 90 : 120, now + duration);
    filter.Q.setValueAtTime(3.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.8, now + 0.4);
    noiseGain.gain.linearRampToValueAtTime(0.6, now + 1.8);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);

    // 2. Sub-bass Oscillator untuk getaran dada
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(isLion ? 85 : 110, now);
    subOsc.frequency.exponentialRampToValueAtTime(isLion ? 55 : 70, now + duration);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.7, now + 0.5);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(220, now);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(dest);

    whiteNoise.start(now);
    subOsc.start(now);
    whiteNoise.stop(now + duration);
    subOsc.stop(now + duration);

    this.currentSourceNodes.push(whiteNoise, subOsc);
    return duration;
  }

  /**
   * Gajah: Lengkingan belalai (Trumpet call frekuensi tinggi dengan getaran)
   */
  private playElephantTrumpet(ctx: AudioContext, dest: GainNode): number {
    const duration = 2.4;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.3);
    osc.frequency.linearRampToValueAtTime(460, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(260, now + duration);

    // Vibrato
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(14, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(35, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const trumpetGain = ctx.createGain();
    trumpetGain.gain.setValueAtTime(0.01, now);
    trumpetGain.gain.linearRampToValueAtTime(0.7, now + 0.2);
    trumpetGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(2.0, now);

    osc.connect(filter);
    filter.connect(trumpetGain);
    trumpetGain.connect(dest);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + duration);
    osc.stop(now + duration);

    this.currentSourceNodes.push(osc, lfo);
    return duration;
  }

  /**
   * Burung / Elang Jawa: Kicauan melodi alam bertingkat
   */
  private playBirdSong(ctx: AudioContext, dest: GainNode): number {
    const duration = 2.5;
    const now = ctx.currentTime;

    const chirps = [
      { start: 0.1, len: 0.35, f1: 1800, f2: 2900 },
      { start: 0.6, len: 0.45, f1: 2200, f2: 3400 },
      { start: 1.2, len: 0.55, f1: 2400, f2: 3800 },
      { start: 1.9, len: 0.4, f1: 2100, f2: 3100 },
    ];

    chirps.forEach(c => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(c.f1, now + c.start);
      osc.frequency.exponentialRampToValueAtTime(c.f2, now + c.start + c.len * 0.5);
      osc.frequency.exponentialRampToValueAtTime(c.f1 * 0.9, now + c.start + c.len);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + c.start);
      gain.gain.linearRampToValueAtTime(0.6, now + c.start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + c.start + c.len);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + c.start);
      osc.stop(now + c.start + c.len);
      this.currentSourceNodes.push(osc);
    });

    return duration;
  }

  /**
   * Primata (Orangutan/Bekantan): Panggilan vokal ritmis khas hutan hujan
   */
  private playPrimateCall(ctx: AudioContext, dest: GainNode): number {
    const duration = 2.6;
    const now = ctx.currentTime;

    const pulses = [
      { start: 0.1, len: 0.35, f: 380 },
      { start: 0.55, len: 0.4, f: 450 },
      { start: 1.05, len: 0.45, f: 520 },
      { start: 1.6, len: 0.6, f: 340 },
    ];

    pulses.forEach(p => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(p.f, now + p.start);
      osc.frequency.linearRampToValueAtTime(p.f * 1.3, now + p.start + p.len * 0.4);
      osc.frequency.linearRampToValueAtTime(p.f * 0.85, now + p.start + p.len);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(p.f * 1.5, now + p.start);
      filter.Q.setValueAtTime(4, now + p.start);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + p.start);
      gain.gain.linearRampToValueAtTime(0.6, now + p.start + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + p.start + p.len);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now + p.start);
      osc.stop(now + p.start + p.len);
      this.currentSourceNodes.push(osc);
    });

    return duration;
  }

  /**
   * Beruang Madu: Geraman serak menengah
   */
  private playBearGrowl(ctx: AudioContext, dest: GainNode): number {
    const duration = 2.2;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(95, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + duration);
    this.currentSourceNodes.push(osc);
    return duration;
  }

  /**
   * Reptil (Komodo / Buaya): Desisan nafas dalam
   */
  private playReptileHiss(ctx: AudioContext, dest: GainNode): number {
    const duration = 2.0;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.linearRampToValueAtTime(900, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(now);
    noise.stop(now + duration);
    this.currentSourceNodes.push(noise);
    return duration;
  }

  /**
   * Suara satwa umum / alam
   */
  private playNatureCall(ctx: AudioContext, dest: GainNode): number {
    const duration = 2.0;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(450, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + duration);
    this.currentSourceNodes.push(osc);
    return duration;
  }
}

export const wildlifeAudio = new WildlifeAudioSynthesizer();
