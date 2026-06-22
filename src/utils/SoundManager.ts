export type SoundType = 'foldSuccess' | 'foldError' | 'selectModel' | 'answerCorrect' | 'answerWrong';

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    this.loadMuteState();
  }

  private ensureContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private loadMuteState(): void {
    const saved = localStorage.getItem('origami-game-muted');
    if (saved !== null) {
      this.muted = saved === 'true';
    }
  }

  private saveMuteState(): void {
    localStorage.setItem('origami-game-muted', String(this.muted));
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    this.saveMuteState();
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.saveMuteState();
  }

  play(type: SoundType): void {
    if (this.muted) return;
    this.ensureContext();
    if (!this.audioContext) return;

    switch (type) {
      case 'foldSuccess':
        this.playFoldSuccess();
        break;
      case 'foldError':
        this.playFoldError();
        break;
      case 'selectModel':
        this.playSelectModel();
        break;
      case 'answerCorrect':
        this.playAnswerCorrect();
        break;
      case 'answerWrong':
        this.playAnswerWrong();
        break;
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3, delay: number = 0): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime + delay;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  private playFoldSuccess(): void {
    this.playTone(523.25, 0.08, 'triangle', 0.25, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.25, 0.06);
  }

  private playFoldError(): void {
    this.playTone(200, 0.15, 'sawtooth', 0.2, 0);
    this.playTone(150, 0.15, 'sawtooth', 0.2, 0.1);
  }

  private playSelectModel(): void {
    this.playTone(440, 0.06, 'square', 0.15, 0);
    this.playTone(550, 0.08, 'square', 0.15, 0.04);
  }

  private playAnswerCorrect(): void {
    this.playTone(523.25, 0.12, 'triangle', 0.3, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.3, 0.1);
    this.playTone(783.99, 0.12, 'triangle', 0.3, 0.2);
    this.playTone(1046.5, 0.25, 'triangle', 0.35, 0.3);
  }

  private playAnswerWrong(): void {
    this.playTone(300, 0.2, 'sawtooth', 0.25, 0);
    this.playTone(250, 0.2, 'sawtooth', 0.25, 0.15);
    this.playTone(200, 0.3, 'sawtooth', 0.3, 0.3);
  }
}
