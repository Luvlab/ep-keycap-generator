// EP Machine Types and Configurations

export type MachineType = 'EP-133' | 'EP-1320' | 'EP-2350' | 'EP-40';
export type GroupId = 'A' | 'B' | 'C' | 'D';
export type PadNumber = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11';
export type FullPadId = `${GroupId}-${PadNumber}`;

export interface MachineConfig {
  id: MachineType;
  name: string;
  description: string;
  groups: GroupId[];
  padsPerGroup: number;
  gridLayout: PadNumber[][]; // Row-by-row layout (top to bottom)
  functionButtons: string[];
  color: string; // Theme color for the machine
}

// Default characters for each pad position
export const DEFAULT_PAD_CHARS: Record<PadNumber, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '+',
  '11': '-',
};

// Grid layout: MIDI-style (0 at bottom-left, 11 at top-right)
const STANDARD_GRID: PadNumber[][] = [
  ['9', '10', '11'],  // Top row
  ['6', '7', '8'],
  ['3', '4', '5'],
  ['0', '1', '2'],    // Bottom row
];

export const MACHINE_CONFIGS: Record<MachineType, MachineConfig> = {
  'EP-133': {
    id: 'EP-133',
    name: 'EP-133 K.O. II',
    description: '128 MB Sampler Composer',
    groups: ['A', 'B', 'C', 'D'],
    padsPerGroup: 12,
    gridLayout: STANDARD_GRID,
    functionButtons: [
      'SYNC', 'BAR', 'BPM',
      'COPY', 'PASTE', 'TIC',
      'PLAY', 'FX',
      'SOUND', 'MAIN', 'TEMPO', 'BOUNCE', 'SYSTEM',
    ],
    color: '#FF6B00', // T.E. Orange
  },
  'EP-1320': {
    id: 'EP-1320',
    name: 'EP-1320 Medieval',
    description: 'Medieval Sampler',
    groups: ['A', 'B', 'C', 'D'],
    padsPerGroup: 12,
    gridLayout: STANDARD_GRID,
    functionButtons: [
      'SYNC', 'BAR', 'BPM',
      'COPY', 'PASTE', 'TIC',
      'PLAY', 'FX',
      'SOUND', 'MAIN', 'TEMPO', 'BOUNCE', 'SYSTEM',
    ],
    color: '#8B4513', // Medieval brown
  },
  'EP-2350': {
    id: 'EP-2350',
    name: 'EP-2350 Choral',
    description: 'Choral Sampler',
    groups: ['A', 'B', 'C', 'D'],
    padsPerGroup: 12,
    gridLayout: STANDARD_GRID,
    functionButtons: [
      'SYNC', 'BAR', 'BPM',
      'COPY', 'PASTE', 'TIC',
      'PLAY', 'FX',
      'SOUND', 'MAIN', 'TEMPO', 'BOUNCE', 'SYSTEM',
    ],
    color: '#4A90D9', // Choral blue
  },
  'EP-40': {
    id: 'EP-40',
    name: 'EP-40',
    description: 'Microphone & FX',
    groups: ['A'],
    padsPerGroup: 12,
    gridLayout: STANDARD_GRID,
    functionButtons: ['TING FX'],
    color: '#1A1A1A', // Dark
  },
};

// Keycap state for customization
export interface Keycap {
  id: FullPadId;
  char: string;
  size: number | null;      // null = use default
  offsetX: number;          // manual X centering offset (mm)
  offsetY: number;          // manual Y centering offset (mm)
  depth: number | null;     // null = use default
}

// Helper to create a full pad ID
export function createPadId(group: GroupId, pad: PadNumber): FullPadId {
  return `${group}-${pad}`;
}

// Helper to parse a full pad ID
export function parsePadId(fullId: FullPadId): { group: GroupId; pad: PadNumber } {
  const [group, pad] = fullId.split('-') as [GroupId, PadNumber];
  return { group, pad };
}

// Create default keycaps for a machine
export function createDefaultKeycaps(machineConfig: MachineConfig): Record<FullPadId, Keycap> {
  const keycaps: Record<FullPadId, Keycap> = {} as Record<FullPadId, Keycap>;

  for (const group of machineConfig.groups) {
    for (let i = 0; i < machineConfig.padsPerGroup; i++) {
      const padNum = String(i) as PadNumber;
      const padId = createPadId(group, padNum);
      keycaps[padId] = {
        id: padId,
        char: DEFAULT_PAD_CHARS[padNum] || padNum,
        size: null,
        offsetX: 0,
        offsetY: 0,
        depth: null,
      };
    }
  }

  return keycaps;
}

// Get total pad count for a machine
export function getTotalPads(machineConfig: MachineConfig): number {
  return machineConfig.groups.length * machineConfig.padsPerGroup;
}
