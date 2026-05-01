# MIDI CC Mapping Requirements

The controller must map UI elements to the following Continuous Controller (CC) parameters supported by the YM2149F synth firmware:

- **Pitch Bend**: standard Pitch Wheel 
- **CC1**: Detune (+-64)
- **CC2**: Vibrato Rate (0 = off)
- **CC3**: Vibrato Amount
- **CC4**: Velocity Sensitivity (0 = off, 1-127 Adjust Range where 1 is least sensitive)
- **CC5**: Arpeggiation Rate (0 = off)
- **CC6**: 16 x Arpeggiation Patterns (Distribute 16 patterns across 0-127 range)
- **CC7**: Arp Mode
- **CC8**: Arpeggiation Octave map
  - `0`: off
  - `1-21`: -36
  - `22-43`: -24
  - `44-63`: -12
  - `64-84`: 0
  - `85-105`: +12
  - `106-126`: +24
  - `127`: +36
- **CC9**: Preset Bank Change (1-64 = Bank A, 65-127 = Bank B)
- **CC10**: Play voices simultaneously toggle (0-64 = Off, 65-127 = On)
- **CC11**: Decay (0 = Off)
- **CC12**: Attack (Note: CC11 must be > 0, otherwise Attack is Off)
