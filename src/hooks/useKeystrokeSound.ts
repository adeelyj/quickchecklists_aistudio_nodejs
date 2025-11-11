import { useState, useEffect, useCallback } from 'react';

// Base64 encoded WAV file for a subtle typewriter key press sound
const KEYSTROKE_SOUND_BASE64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA';

export const useKeystrokeSound = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    // Initialize AudioContext on client-side after first interaction (or mount)
    if (typeof window !== 'undefined' && !audioContext) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
    }
  }, [audioContext]);

  useEffect(() => {
    if (audioContext && !audioBuffer) {
      fetch(KEYSTROKE_SOUND_BASE64)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(decodedBuffer => {
          setAudioBuffer(decodedBuffer);
        })
        .catch(error => console.error('Error decoding audio data:', error));
    }
  }, [audioContext, audioBuffer]);

  const play = useCallback(() => {
    if (audioBuffer && audioContext && audioContext.state === 'running') {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Add a GainNode to control the volume
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Set volume to 10%
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start(0);
    } else if (audioContext && audioContext.state === 'suspended') {
      // Resume context if it was suspended (e.g., due to browser policy)
      audioContext.resume();
    }
  }, [audioBuffer, audioContext]);

  return play;
};
