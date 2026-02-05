// EP Machine Types — 20 Linear Keycaps

export type MachineType = 'EP-133' | 'EP-1320' | 'EP-40';

// Keycap definition (static, same for all machines)
export interface KeycapDefinition {
  position: number;       // 0-19, left to right
  id: string;             // Unique key: "A", "9", "PLAY", etc.
  defaultLabel: string;   // Default display text
  category: 'bank' | 'number' | 'operator' | 'transport';
}

// The canonical 20-keycap sequence, left to right on the device
export const KEYCAP_SEQUENCE: KeycapDefinition[] = [
  { position: 0,  id: 'A',     defaultLabel: 'A',   category: 'bank' },
  { position: 1,  id: 'B',     defaultLabel: 'B',   category: 'bank' },
  { position: 2,  id: 'C',     defaultLabel: 'C',   category: 'bank' },
  { position: 3,  id: 'D',     defaultLabel: 'D',   category: 'bank' },
  { position: 4,  id: '9',     defaultLabel: '9',   category: 'number' },
  { position: 5,  id: '8',     defaultLabel: '8',   category: 'number' },
  { position: 6,  id: '7',     defaultLabel: '7',   category: 'number' },
  { position: 7,  id: '6',     defaultLabel: '6',   category: 'number' },
  { position: 8,  id: '5',     defaultLabel: '5',   category: 'number' },
  { position: 9,  id: '4',     defaultLabel: '4',   category: 'number' },
  { position: 10, id: '3',     defaultLabel: '3',   category: 'number' },
  { position: 11, id: '2',     defaultLabel: '2',   category: 'number' },
  { position: 12, id: '1',     defaultLabel: '1',   category: 'number' },
  { position: 13, id: 'DOT',   defaultLabel: '\u00B7', category: 'number' },   // Middle dot
  { position: 14, id: '0',     defaultLabel: '0',   category: 'number' },
  { position: 15, id: 'ENTER', defaultLabel: 'ENT', category: 'operator' },
  { position: 16, id: 'MINUS', defaultLabel: '\u2212', category: 'operator' }, // Minus sign
  { position: 17, id: 'PLUS',  defaultLabel: '+',   category: 'operator' },
  { position: 18, id: 'REC',   defaultLabel: 'REC', category: 'transport' },
  { position: 19, id: 'PLAY',  defaultLabel: 'PLAY', category: 'transport' },
];

// Machine configuration
export interface MachineConfig {
  id: MachineType;
  name: string;
  description: string;
  color: string;
  svgAsset: string | null;        // Path to SVG background
  dotVariant: 'dot' | 'square';   // Position 13 appearance
}

export const MACHINE_CONFIGS: Record<MachineType, MachineConfig> = {
  'EP-133': {
    id: 'EP-133',
    name: 'EP-133 K.O. II',
    description: '128 MB Sampler Composer',
    color: '#FF6B00',
    svgAsset: '/machines/ep-133.svg',
    dotVariant: 'dot',
  },
  'EP-1320': {
    id: 'EP-1320',
    name: 'EP-1320 Medieval',
    description: 'Medieval Sampler',
    color: '#8B4513',
    svgAsset: '/machines/ep-1320.svg',
    dotVariant: 'dot',
  },
  'EP-40': {
    id: 'EP-40',
    name: 'EP-40',
    description: 'Microphone & FX',
    color: '#00503A',
    svgAsset: '/machines/ep-40.svg',
    dotVariant: 'square',
  },
};

// Per-keycap customization state
export interface Keycap {
  id: string;              // Matches KeycapDefinition.id
  position: number;        // 0-19
  char: string;            // Custom character to engrave
  size: number | null;     // null = use default
  offsetX: number;         // Manual X centering offset (mm)
  offsetY: number;         // Manual Y centering offset (mm)
  depth: number | null;    // null = use default
}

// Create default keycaps for a machine
export function createDefaultKeycaps(config: MachineConfig): Record<string, Keycap> {
  const keycaps: Record<string, Keycap> = {};

  for (const def of KEYCAP_SEQUENCE) {
    let label = def.defaultLabel;
    // EP-40 uses a filled square instead of a dot for position 13
    if (def.id === 'DOT' && config.dotVariant === 'square') {
      label = '\u25A0';
    }
    keycaps[def.id] = {
      id: def.id,
      position: def.position,
      char: label,
      size: null,
      offsetX: 0,
      offsetY: 0,
      depth: null,
    };
  }

  return keycaps;
}
