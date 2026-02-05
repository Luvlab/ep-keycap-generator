import { MACHINE_CONFIGS, type MachineType } from '../types/machines';

interface Props {
  selectedMachine: MachineType;
  detectedMachine: MachineType | null;
  onSelect: (machine: MachineType) => void;
  midiSupported: boolean;
}

export default function MachineSelector({
  selectedMachine,
  detectedMachine,
  onSelect,
  midiSupported,
}: Props) {
  const config = MACHINE_CONFIGS[selectedMachine];

  return (
    <div className="machine-selector">
      <div className="selector-row">
        <label className="selector-label">Machine</label>
        <select
          value={selectedMachine}
          onChange={(e) => onSelect(e.target.value as MachineType)}
          className="machine-select"
        >
          {Object.values(MACHINE_CONFIGS).map((machineConfig) => (
            <option key={machineConfig.id} value={machineConfig.id}>
              {machineConfig.name}
              {detectedMachine === machineConfig.id ? ' (Connected)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* MIDI Status Indicator */}
      <div className="midi-status">
        {midiSupported ? (
          detectedMachine ? (
            <span className="midi-connected">
              <span className="status-dot connected" />
              {detectedMachine} detected via MIDI
            </span>
          ) : (
            <span className="midi-waiting">
              <span className="status-dot waiting" />
              No device detected
            </span>
          )
        ) : (
          <span className="midi-unsupported">
            <span className="status-dot unsupported" />
            MIDI not available
          </span>
        )}
      </div>

      {/* Machine Info */}
      <div className="machine-info">
        <span className="info-description">{config.description}</span>
        <span className="info-pads">
          {config.groups.length} groups × {config.padsPerGroup} pads = {config.groups.length * config.padsPerGroup} total
        </span>
      </div>

      <style>{`
        .machine-selector {
          background: var(--te-gray, #2D2D2D);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .selector-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .selector-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          min-width: 60px;
        }

        .machine-select {
          flex: 1;
          background: #1A1A1A;
          border: 1px solid #444;
          border-radius: 4px;
          color: white;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
        }

        .machine-select:hover {
          border-color: #666;
        }

        .machine-select:focus {
          outline: none;
          border-color: var(--te-orange, #FF6B00);
        }

        .midi-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }

        .status-dot.connected {
          background: #4CAF50;
          box-shadow: 0 0 6px #4CAF50;
        }

        .status-dot.waiting {
          background: #888;
          animation: pulse 2s infinite;
        }

        .status-dot.unsupported {
          background: #666;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .midi-connected {
          color: #4CAF50;
        }

        .midi-waiting {
          color: #888;
        }

        .midi-unsupported {
          color: #666;
        }

        .machine-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #666;
        }

        .info-description {
          font-style: italic;
        }

        .info-pads {
          color: var(--te-orange, #FF6B00);
        }
      `}</style>
    </div>
  );
}
