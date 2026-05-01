// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PresetState = Record<string, any>;
type Listener = (state: PresetState) => void;

class PresetManager {
  private currentState: PresetState = {};
  private listeners: Set<Listener> = new Set();
  private readonly STORAGE_KEY = 'ym2149_presets';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setValue(key: string, value: any) {
    this.currentState[key] = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getValue(key: string): any {
    return this.currentState[key];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentState));
  }

  public savePreset(name: string) {
    const presets = this.getPresets();
    presets[name] = { ...this.currentState };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
  }

  public loadPreset(name: string) {
    const presets = this.getPresets();
    if (presets[name]) {
      this.currentState = { ...this.currentState, ...presets[name] };
      this.notify();
    }
  }

  public getPresetNames(): string[] {
    return Object.keys(this.getPresets());
  }

  private getPresets(): Record<string, PresetState> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse presets from localStorage', e);
      }
    }
    return {};
  }
}

export const presetManager = new PresetManager();
