import { useState, useEffect, useCallback } from 'react';
import type { MachineType } from '../types/machines';

interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
}

interface UseMidiDetectionReturn {
  detectedMachine: MachineType | null;
  isSupported: boolean;
  devices: MidiDevice[];
  error: string | null;
}

/**
 * Hook for detecting connected Teenage Engineering EP machines via Web MIDI API.
 * Auto-detects EP-133, EP-1320, and EP-40 based on device name.
 */
export function useMidiDetection(): UseMidiDetectionReturn {
  const [detectedMachine, setDetectedMachine] = useState<MachineType | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const detectMachineFromName = useCallback((name: string): MachineType | null => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('ep-133') || lowerName.includes('ep133') || lowerName.includes('ko ii') || lowerName.includes('k.o. ii')) {
      return 'EP-133';
    }
    if (lowerName.includes('ep-1320') || lowerName.includes('ep1320') || lowerName.includes('medieval')) {
      return 'EP-1320';
    }
    if (lowerName.includes('ep-40') || lowerName.includes('ep40')) {
      return 'EP-40';
    }
    // Generic Teenage Engineering device - default to EP-133
    if (lowerName.includes('teenage') || lowerName.includes('t.e.')) {
      return 'EP-133';
    }

    return null;
  }, []);

  const updateDeviceList = useCallback((access: MIDIAccess) => {
    const midiDevices: MidiDevice[] = [];
    let detectedType: MachineType | null = null;

    // Collect all inputs
    access.inputs.forEach((input) => {
      midiDevices.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown',
      });

      // Try to detect machine type from this device
      if (!detectedType) {
        const detected = detectMachineFromName(input.name || '');
        if (detected) {
          detectedType = detected;
        }
      }
    });

    // Also check outputs for device identification
    access.outputs.forEach((output) => {
      if (!detectedType) {
        const detected = detectMachineFromName(output.name || '');
        if (detected) {
          detectedType = detected;
        }
      }
    });

    setDevices(midiDevices);
    setDetectedMachine(detectedType);

    if (detectedType) {
      console.log(`[MIDI] Detected: ${detectedType}`);
    }
  }, [detectMachineFromName]);

  useEffect(() => {
    // Check if Web MIDI API is supported
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false);
      setError('Web MIDI API not supported in this browser');
      console.warn('[MIDI] Web MIDI API not supported');
      return;
    }

    // Request MIDI access (without SysEx for basic detection)
    navigator.requestMIDIAccess({ sysex: false })
      .then((access) => {
        console.log('[MIDI] Access granted');
        updateDeviceList(access);

        // Listen for device connect/disconnect
        access.onstatechange = () => {
          console.log('[MIDI] Device state changed');
          updateDeviceList(access);
        };
      })
      .catch((err) => {
        console.error('[MIDI] Access denied:', err);
        setIsSupported(false);
        setError('MIDI access denied. Please allow MIDI access in your browser.');
      });
  }, [updateDeviceList]);

  return {
    detectedMachine,
    isSupported,
    devices,
    error,
  };
}
