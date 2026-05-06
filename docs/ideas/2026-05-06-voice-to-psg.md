# 💡 Bulb [Experimental]: Voice-to-PSG

## Concept
"Voice-to-PSG" is an experimental accessibility and hands-free control feature that leverages the native Web Speech API (`SpeechRecognition`). It allows users to issue vocal commands to control specific synthesizer states without touching the interface or a connected MIDI controller.

Since the ARDUINO-YM2149F requires physical hands-on tweaking, having a hands-free way to trigger utility functions (like Panic or Bank switching) creates a "studio assistant" feel.

## Feasibility Study
- **Web API:** Native Web Speech API (`window.SpeechRecognition` or `window.webkitSpeechRecognition`).
- **External Libraries:** None. This is fully supported in modern Chrome/Edge and Safari natively.
- **Hardware Truth:** All output MIDI CCs are supported by the ARDUINO-YM2149F.
  - "Panic" -> CC 123 (All Notes Off)
  - "Unison on" -> CC 10, Value 127 (Play voices simultaneously)
  - "Unison off" -> CC 10, Value 0
  - "Bank A" -> CC 9, Value 0 (Preset Bank Change)
  - "Bank B" -> CC 9, Value 127

The browser handles the transcription locally or via its native engine, meaning there is no latency introduced by an external API call like OpenAI or Google Cloud. The transcription is instantly mapped to `midiService.sendCC()`.

## UI Prototype
The implementation fits entirely within a single small React component, adhering to the <100 lines rule for prototypes.

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { midiService } from '../services/midiService';

const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

export const VoiceControl: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const command = event.results[current][0].transcript.toLowerCase().trim();
      setTranscript(command);

      // Map commands to YM2149 CCs
      if (command.includes('panic') || command.includes('stop')) {
        for (let ch = 1; ch <= 16; ch++) {
          midiService.sendCC(ch, 123, 0); // All Notes Off
        }
      } else if (command.includes('unison on')) {
        midiService.sendCC(1, 10, 127);
      } else if (command.includes('unison off')) {
        midiService.sendCC(1, 10, 0);
      } else if (command.includes('bank a')) {
        midiService.sendCC(1, 9, 0);
      } else if (command.includes('bank b')) {
        midiService.sendCC(1, 9, 127);
      }
    };

    return () => recognitionRef.current?.stop();
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!SpeechRecognition) {
    return <div className="text-red-500 text-sm">Web Speech API not supported in this browser.</div>;
  }

  return (
    <div className="p-4 border rounded-md bg-gray-900 text-white flex flex-col items-center">
      <button
        onClick={toggleListening}
        className={`px-4 py-2 rounded-full font-bold transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'}`}
        aria-pressed={isListening}
      >
        {isListening ? 'Listening...' : 'Enable Voice Control'}
      </button>
      <div className="mt-4 text-xs text-gray-400 min-h-[1.5rem]">
        {transcript ? `Heard: "${transcript}"` : 'Say "Panic", "Unison On", or "Bank A"'}
      </div>
    </div>
  );
};
```
