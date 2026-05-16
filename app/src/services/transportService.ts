type TransportListener = (state: { bpm: number, isPlaying: boolean, currentStep: number }) => void;

class TransportService {
  public bpm: number = 120;
  public isPlaying: boolean = false;
  public currentStep: number = 0;
  private listeners: TransportListener[] = [];
  private nextNoteTime: number = 0;
  private timerId: number | null = null;

  private tick = () => {
    if (!this.isPlaying) return;

    const currentTime = performance.now();
    
    // If it's time for the next note
    while (this.nextNoteTime <= currentTime) {
      this.notify(); 
      this.advanceNote();
    }

    this.timerId = requestAnimationFrame(this.tick);
  };

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    // 0.25 of a beat is a 16th note
    this.nextNoteTime += 0.25 * secondsPerBeat * 1000;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  public play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = performance.now();
    this.tick();
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) cancelAnimationFrame(this.timerId);
    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    this.currentStep = 0;
    if (this.timerId) cancelAnimationFrame(this.timerId);
    this.notify();
  }

  public setBpm(bpm: number) {
    this.bpm = Math.max(20, Math.min(300, bpm));
    this.notify();
  }

  public subscribe(listener: TransportListener) {
    this.listeners.push(listener);
    // Give initial state
    listener({ bpm: this.bpm, isPlaying: this.isPlaying, currentStep: this.currentStep });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const state = { bpm: this.bpm, isPlaying: this.isPlaying, currentStep: this.currentStep };
    this.listeners.forEach(l => l(state));
  }
}

export const transportService = new TransportService();
