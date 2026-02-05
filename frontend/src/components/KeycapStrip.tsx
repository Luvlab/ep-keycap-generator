import { useState } from 'react';
import { KEYCAP_SEQUENCE, type MachineConfig, type Keycap } from '../types/machines';

interface Props {
  machineConfig: MachineConfig;
  keycaps: Record<string, Keycap>;
  selectedKeycap: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<Keycap>) => void;
  fontFamily: string;
}

export default function KeycapStrip({
  machineConfig,
  keycaps,
  selectedKeycap,
  onSelect,
  onUpdate,
  fontFamily,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (id: string) => {
    setEditingId(id);
    setEditValue(keycaps[id]?.char || '');
  };

  const finishEdit = () => {
    if (editingId && editValue.length > 0) {
      onUpdate(editingId, { char: editValue.slice(0, 4) });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') finishEdit();
    else if (e.key === 'Escape') setEditingId(null);
  };

  const { padPositions } = machineConfig;

  return (
    <div className="keycap-overlay-wrapper">
      {/* Machine SVG as background with keycaps overlaid */}
      <div className="machine-container">
        {machineConfig.svgAsset && (
          <img
            src={machineConfig.svgAsset}
            alt={machineConfig.name}
            className="machine-svg"
            draggable={false}
          />
        )}

        {/* 20 keycap buttons absolutely positioned over the SVG */}
        {KEYCAP_SEQUENCE.map((def) => {
          const keycap = keycaps[def.id];
          const pos = padPositions[def.id];
          if (!pos) return null;

          const isSelected = selectedKeycap === def.id;
          const isEditing = editingId === def.id;

          return (
            <button
              key={def.id}
              className={`pad-button ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${pos.w}%`,
                height: `${pos.h}%`,
                '--machine-color': machineConfig.color,
              } as React.CSSProperties}
              onClick={() => {
                if (!isEditing) onSelect(isSelected ? null : def.id);
              }}
              onDoubleClick={() => startEdit(def.id)}
              title={`${def.id} (position ${def.position})`}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={finishEdit}
                  onKeyDown={handleKeyDown}
                  className="pad-edit"
                  autoFocus
                  maxLength={4}
                />
              ) : (
                <>
                  <span
                    className="pad-char"
                    style={{ fontFamily: fontFamily || 'inherit' }}
                  >
                    {keycap?.char || def.defaultLabel}
                  </span>
                  <span className="pad-label">{def.id}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        .keycap-overlay-wrapper {
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          background: #1a1a1a;
        }

        .machine-container {
          position: relative;
          width: 100%;
        }

        .machine-svg {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          user-select: none;
          opacity: 0.35;
        }

        /* Each keycap button is absolutely positioned over the SVG */
        .pad-button {
          position: absolute;
          background: rgba(40, 40, 40, 0.85);
          border: 2px solid rgba(100, 100, 100, 0.5);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          padding: 2px;
          box-sizing: border-box;
        }

        .pad-button:hover {
          background: rgba(60, 60, 60, 0.95);
          border-color: rgba(150, 150, 150, 0.7);
          transform: scale(1.08);
          z-index: 2;
        }

        .pad-button.selected {
          border-color: var(--machine-color, #FF6B00);
          background: rgba(60, 60, 60, 0.95);
          transform: scale(1.12);
          box-shadow: 0 0 16px color-mix(in srgb, var(--machine-color, #FF6B00) 50%, transparent);
          z-index: 3;
        }

        .pad-char {
          font-size: clamp(10px, 2.5vw, 22px);
          font-weight: bold;
          color: #fff;
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 90%;
          text-align: center;
        }

        .pad-label {
          font-size: clamp(6px, 0.8vw, 9px);
          color: #888;
          position: absolute;
          bottom: 2px;
          left: 0;
          right: 0;
          text-align: center;
          letter-spacing: 0.3px;
          pointer-events: none;
        }

        .pad-edit {
          width: 90%;
          height: 60%;
          background: transparent;
          border: none;
          color: white;
          text-align: center;
          font-size: clamp(10px, 2vw, 18px);
          font-weight: bold;
          outline: none;
          padding: 0;
        }

        /* Responsive: ensure container doesn't get too small */
        @media (max-width: 640px) {
          .pad-char {
            font-size: clamp(8px, 3vw, 14px);
          }
          .pad-label {
            font-size: 5px;
          }
        }
      `}</style>
    </div>
  );
}
