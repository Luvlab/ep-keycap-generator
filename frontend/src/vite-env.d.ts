/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Web MIDI API types
interface MIDIAccess {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
  onstatechange: ((this: MIDIAccess, ev: Event) => void) | null;
}

interface MIDIInput {
  id: string;
  name: string | null;
  manufacturer: string | null;
  state: string;
  type: string;
}

interface MIDIOutput {
  id: string;
  name: string | null;
  manufacturer: string | null;
  state: string;
  type: string;
}

interface Navigator {
  requestMIDIAccess?(options?: { sysex?: boolean }): Promise<MIDIAccess>;
}
