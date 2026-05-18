import { midiService, type MidiLogEntry } from './midiService';

class LocalAudioService {
  private ctx: AudioContext | null = null;
  private activeOscillators: Map<string, { osc: OscillatorNode, gain: GainNode }> = new Map();
  private unsubscribe: (() => void) | null = null;

  public initialize() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended (common browser policy)
    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }

    this.unsubscribe = midiService.subscribeMessage(this.handleMidiMessage.bind(this));
  }

  public shutdown() {
    if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
    }
    
    // Stop all active notes
    this.activeOscillators.forEach(({ osc, gain }) => {
        try {
            osc.stop();
            osc.disconnect();
            gain.disconnect();
        } catch (e) {
            // Ignore errors if already stopped
        }
    });
    this.activeOscillators.clear();

    if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
    }
  }

  private handleMidiMessage(msg: Omit<MidiLogEntry, 'timestamp'>) {
      if (!this.ctx) return;

      if (msg.type === 'AllNotesOff') {
          this.activeOscillators.forEach(({ osc, gain }) => {
              osc.stop();
              osc.disconnect();
              gain.disconnect();
          });
          this.activeOscillators.clear();
          return;
      }

      if (msg.type === 'NoteOn') {
          const [note, velocity] = msg.data;
          // Velocity 0 is NoteOff
          if (velocity === 0) {
              this.stopNote(msg.channel!, note);
          } else {
              this.playNote(msg.channel!, note, velocity);
          }
      } else if (msg.type === 'NoteOff') {
          const [note] = msg.data;
          this.stopNote(msg.channel!, note);
      }
  }

  private playNote(channel: number, note: number, velocity: number) {
      if (!this.ctx) return;
      const key = `${channel}_${note}`;
      
      // Stop existing if any
      this.stopNote(channel, note);

      const t = this.ctx.currentTime;
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      const normalizedVel = velocity / 127;
      
      // Prevent deafening volumes
      const maxVol = 0.2; 
      
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0, t);
      // Fast attack
      gainNode.gain.linearRampToValueAtTime(normalizedVel * maxVol, t + 0.01);
      gainNode.connect(this.ctx.destination);

      if (channel === 10) {
          // Drum channel
          switch(note) {
              case 64: this.playKick(t); break;
              case 63: this.playSnare(t); break;
              case 62: this.playHiHat(t); break;
              case 61: this.playBassThing(t); break;
              case 60: this.playDogYap(t); break;
              default: this.playNoiseBurst(t, 0.2, 1); break;
          }
          return;
      }

      // Melodic channel - Square wave
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      osc.connect(gainNode);
      osc.start();

      this.activeOscillators.set(key, { osc, gain: gainNode });
  }

  private stopNote(channel: number, note: number) {
      const key = `${channel}_${note}`;
      const nodes = this.activeOscillators.get(key);
      if (nodes && this.ctx) {
          const t = this.ctx.currentTime;
          // Quick release
          nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, t);
          nodes.gain.gain.linearRampToValueAtTime(0, t + 0.05);
          nodes.osc.stop(t + 0.05);
          
          setTimeout(() => {
              try {
                nodes.osc.disconnect();
                nodes.gain.disconnect();
              } catch (e) {}
          }, 60);

          this.activeOscillators.delete(key);
      }
  }

  private playKick(t: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.8, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

      osc.start(t);
      osc.stop(t + 0.5);
      
      setTimeout(() => { try { osc.disconnect(); gain.disconnect(); } catch(e){} }, 600);
  }

  private playSnare(t: number) {
      if (!this.ctx) return;
      
      // Snare "snap"
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(250, t);
      oscGain.gain.setValueAtTime(0.5, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);

      // Snare "rattle"
      this.playNoiseBurst(t, 0.2, 0.8);
  }

  private playHiHat(t: number) {
      this.playNoiseBurst(t, 0.05, 1); // very short burst
  }

  private playBassThing(t: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(55, t); // Low A
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc.start(t);
      osc.stop(t + 0.3);
      
      setTimeout(() => { try { osc.disconnect(); gain.disconnect(); } catch(e){} }, 400);
  }

  private playDogYap(t: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(600, t + 0.05); // slight pitch up
      osc.frequency.linearRampToValueAtTime(300, t + 0.1);  // then pitch down
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      osc.start(t);
      osc.stop(t + 0.15);
      
      setTimeout(() => { try { osc.disconnect(); gain.disconnect(); } catch(e){} }, 200);
  }

  private playNoiseBurst(t: number, duration: number, density: number) {
      if (!this.ctx) return;
      
      const gainNode = this.ctx.createGain();
      gainNode.connect(this.ctx.destination);

      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * density;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.connect(gainNode);

      noise.start(t);
      
      // Decay
      gainNode.gain.setValueAtTime(0.3, t); // Lower volume than melodic notes
      gainNode.gain.exponentialRampToValueAtTime(0.01, t + (duration * 0.75));
      noise.stop(t + duration);

      // Automatically clean up
      setTimeout(() => {
          try {
             noise.disconnect();
             gainNode.disconnect();
          } catch(e) {}
      }, duration * 1000 + 50);
  }
}

export const localAudioService = new LocalAudioService();
