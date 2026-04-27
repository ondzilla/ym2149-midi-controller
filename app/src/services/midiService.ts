/**
 * midiService.ts
 * 
 * Abstraction layer for the Web MIDI API (`navigator.requestMIDIAccess`).
 * Tracks inputs/outputs and notifies UI on device plug/unplug.
 */

export class MidiService {
  private midiAccess: MIDIAccess | null = null;
  public outputDevice: MIDIOutput | null = null;
  
  public inputs: MIDIInput[] = [];
  public outputs: MIDIOutput[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    try {
      this.midiAccess = await globalThis.navigator.requestMIDIAccess();
      this.refreshDevices();

      // Listen for hardware plug/unplug events
      this.midiAccess.onstatechange = () => {
        this.refreshDevices();
      };
    } catch (err) {
      console.warn('Failed to get MIDI access. Ensure HTTPS or localhost.', err);
    }
  }

  private refreshDevices() {
    if (!this.midiAccess) return;
    this.inputs = Array.from(this.midiAccess.inputs.values());
    this.outputs = Array.from(this.midiAccess.outputs.values());
    this.notify();
  }

  public setOutputDevice(id: string) {
    this.outputDevice = this.outputs.find(o => o.id === id) || null;
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  /**
   * Sends a standard MIDI control change (CC) message.
   * @param channel MIDI Channel (1-16)
   */
  public sendCC(channel: number, ccNumber: number, value: number) {
    if (!this.outputDevice) return;
    
    // MIDI Channel translates to 0-15 internally. (1 & 0x0F) - 1 => 0.
    const internalChannel = Math.max(0, channel - 1) & 0x0F;
    const statusByte = 0xB0 | internalChannel;
    const message = [statusByte, ccNumber, value];
    
    this.outputDevice.send(message);
  }

  /**
   * Sends a standard MIDI Note On message.
   */
  public sendNoteOn(channel: number, note: number, velocity: number) {
    if (!this.outputDevice) return;
    
    const internalChannel = Math.max(0, channel - 1) & 0x0F;
    const statusByte = 0x90 | internalChannel;
    const message = [statusByte, note, velocity];
    
    this.outputDevice.send(message);
  }

  /**
   * Sends a 14-bit MIDI Pitch Bend message.
   */
  public sendPitchBend(channel: number, value: number) {
    if (!this.outputDevice) return;
    
    const internalChannel = Math.max(0, channel - 1) & 0x0F;
    const statusByte = 0xE0 | internalChannel;
    
    const lsb = value & 0x7F;
    const msb = (value >> 7) & 0x7F;
    const message = [statusByte, lsb, msb];
    
    this.outputDevice.send(message);
  }
}

export const midiService = new MidiService();
