import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MidiService } from '../midiService';

describe('MidiService', () => {
  let midiService: MidiService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockOutputDevice: any;

  beforeEach(() => {
    mockOutputDevice = {
      id: 'test-output',
      send: vi.fn(),
    };

    // Globally mock the requestMIDIAccess to return an output device automatically
    const mockMIDIAccess = {
      inputs: new Map(),
      outputs: new Map([['test-output', mockOutputDevice]]),
      onstatechange: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(globalThis.navigator, 'requestMIDIAccess').mockResolvedValue(mockMIDIAccess as any);

    // Create new instance before each test
    midiService = new MidiService();
  });

  it('should correctly format and send a CC message on MIDI Channel 1 (1-indexed)', async () => {
    // Wait for the asynchronous init() in the constructor to resolve
    await new Promise(process.nextTick);

    midiService.setOutputDevice('test-output');
    // Channel 1, CC 10, Value 127
    midiService.sendCC(1, 10, 127);

    // Expect status byte 0xB0 (Channel 1 implies zero-index 0)
    expect(mockOutputDevice.send).toHaveBeenCalledWith([0xB0, 10, 127]);
  });

  it('should correctly format and send a CC message on MIDI Channel 10', async () => {
    await new Promise(process.nextTick);

    midiService.setOutputDevice('test-output');
    // Channel 10, CC 1, Value 64
    midiService.sendCC(10, 1, 64);

    // Expect status byte 0xB9
    expect(mockOutputDevice.send).toHaveBeenCalledWith([0xB9, 1, 64]);
  });

  it('should correctly format and send a Pitch Bend message', async () => {
    await new Promise(process.nextTick);
    midiService.setOutputDevice('test-output');

    // Channel 1, Value 8192 (Center)
    midiService.sendPitchBend(1, 8192);

    // Expected: status 0xE0, LSB 0, MSB 64
    expect(mockOutputDevice.send).toHaveBeenCalledWith([0xE0, 0, 64]);
  });

  it('should correctly format and send a Note On message on MIDI Channel 1', async () => {
    await new Promise(process.nextTick);
    midiService.setOutputDevice('test-output');

    // Channel 1, Note 60 (Middle C), Velocity 127
    midiService.sendNoteOn(1, 60, 127);

    // Expected: status 0x90, Note 60, Velocity 127
    expect(mockOutputDevice.send).toHaveBeenCalledWith([0x90, 60, 127]);
  });

  it('should correctly format and send a Note On message on MIDI Channel 10', async () => {
    await new Promise(process.nextTick);
    midiService.setOutputDevice('test-output');

    // Channel 10, Note 60, Velocity 64
    midiService.sendNoteOn(10, 60, 64);

    // Expected: status 0x99, Note 60, Velocity 64
    expect(mockOutputDevice.send).toHaveBeenCalledWith([0x99, 60, 64]);
  });

});
