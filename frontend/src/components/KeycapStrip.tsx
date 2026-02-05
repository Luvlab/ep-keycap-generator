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

  // Group keycaps by category for visual spacing
  const prevCategory = (i: number) =>
    i > 0 ? KEYCAP_SEQUENCE[i - 1].category : null;

  return (
    <div className="keycap-strip-wrapper">
      {/* Machine SVG background */}
      {machineConfig.svgAsset && (
        <div className="machine-bg">
          <img
            src={machineConfig.svgAsset}
            alt={machineConfig.name}
            draggable={false}
          />
        </div>
      )}

      {/* 20 keycaps in a row */}
      <div className="keycap-row">
        {KEYCAP_SEQUENCE.map((def, i) => {
          const keycap = keycaps[def.id];
          const isSelected = selectedKeycap === def.id;
          const isEditing = editingId === def.id;
          const newGroup = prevCategory(i) !== null && prevCategory(i) !== def.category;

          return (
            <button
              key={def.id}
              className={`keycap ${isSelected ? 'selected' : ''} ${newGroup ? 'gap-left' : ''}`}
              style={{
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
                  className="keycap-edit"
                  autoFocus
                  maxLength={4}
                />
              ) : (
                <>
                  <span
                    className="keycap-char"
                    style={{ fontFamily: fontFamily || 'inherit' }}
                  >
                    {keycap?.char || def.defaultLabel}
                  </span>
                  <span className="keycap-label">{def.id}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        .keycap-strip-wrapper {
          position: relative;
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          background: #1a1a1a;
        }

        .machine-bg {
          width: 100%;
          pointer-events: none;
          user-select: none;
          opacity: 0.2;
        }

        .machine-bg img {
          width: 100%;
          height: auto;
          display: block;
        }

        .keycap-row {
          display: flex;
          gap: 3px;
          padding: 12px 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* When SVG is present, overlay the keycap row on the bottom */
        .machine-bg + .keycap-row {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px 6px 12px;
          background: linear-gradient(transparent, rgba(0,0,0,0.7) 30%);
        }

        .keycap {
          flex: 1 0 0;
          min-width: 36px;
          aspect-ratio: 1;
          background: rgba(51, 51, 51, 0.9);
          border: 2px solid transparent;
          border-radius: 5px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
          position: relative;
          padding: 2px;
        }

        .keycap:hover {
          background: rgba(68, 68, 68, 0.95);
          transform: scale(1.06);
          z-index: 1;
        }

        .keycap.selected {
          border-color: var(--machine-color, #FF6B00);
          background: rgba(68, 68, 68, 0.95);
          transform: scale(1.1);
          box-shadow: 0 0 14px color-mix(in srgb, var(--machine-color, #FF6B00) 40%, transparent);
          z-index: 2;
        }

        /* Extra gap between category groups */
        .keycap.gap-left {
          margin-left: 6px;
        }

        .keycap-char {
          font-size: clamp(11px, 1.8vw, 18px);
          font-weight: bold;
          color: #fff;
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .keycap-label {
          font-size: 7px;
          color: #666;
          position: absolute;
          bottom: 1px;
          left: 0;
          right: 0;
          text-align: center;
          letter-spacing: 0.3px;
          pointer-events: none;
        }

        .keycap-edit {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          color: white;
          text-align: center;
          font-size: clamp(10px, 1.6vw, 16px);
          font-weight: bold;
          outline: none;
          padding: 0;
        }

        /* Mobile: allow horizontal scroll */
        @media (max-width: 640px) {
          .keycap {
            min-width: 32px;
            flex: 0 0 32px;
          }
        }
      `}</style>
    </div>
  );
}
