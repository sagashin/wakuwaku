'use client';

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * 音声読み上げ (Web Speech API)
   */
  public speak(text: string, pitch = 1.15, rate = 1.0) {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ja-JP';
      utter.pitch = pitch;
      utter.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find((v) => v.lang.includes('ja') || v.lang.includes('JP'));
      if (jaVoice) utter.voice = jaVoice;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech synthesis errors on unsupported headless environments
    }
  }

  /**
   * ピロリン♪（マリオ風コイン音）
   */
  public playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.43);
  }

  /**
   * ブッブー！（不正解音）
   */
  public playWrong() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(140, now + 0.16);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * ドカーン！（かめはめ波・必殺技ビーム音）
   */
  public playBeamExplosion() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. チャージ〜発射の高音スイープ
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.75);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);

    // 2. ホワイトノイズ爆発音
    const bufferSize = ctx.sampleRate * 0.65;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.2));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now + 0.15);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.32, now + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now + 0.15);
  }

  /**
   * どかんワープ音（ピュ〜ン・シュポン）
   */
  public playPipeWarp() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [659.25, 523.25, 392.0, 261.63];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + (idx + 1) * 0.065);
    });
  }

  /**
   * ファンファーレ♪（ゲットだぜ！・ステージクリア・シェンロン出現）
   */
  public playFanfare(grand = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = grand
      ? [
          { f: 523.25, t: 0, d: 0.14 },
          { f: 659.25, t: 0.14, d: 0.14 },
          { f: 783.99, t: 0.28, d: 0.14 },
          { f: 1046.5, t: 0.42, d: 0.25 },
          { f: 783.99, t: 0.68, d: 0.14 },
          { f: 1046.5, t: 0.84, d: 0.55 },
        ]
      : [
          { f: 523.25, t: 0, d: 0.11 },
          { f: 659.25, t: 0.11, d: 0.11 },
          { f: 783.99, t: 0.22, d: 0.11 },
          { f: 1046.5, t: 0.34, d: 0.36 },
        ];

    melody.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.24, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.02);
    });
  }
}

export const soundEngine = new SoundEngine();
