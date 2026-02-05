import { useState } from 'react';
import type { MachineConfig, FullPadId, GroupId, Keycap } from '../types/machines';
import { createPadId } from '../types/machines';

interface Props {
  machineConfig: MachineConfig;
  keycaps: Record<FullPadId, Keycap>;
  selectedPad: FullPadId | null;
  onSelect: (padId: FullPadId | null) => void;
  onUpdate: (padId: FullPadId, updates: Partial<Keycap>) => void;
  fontFamily: string;
  activeGroup: GroupId;
  onGroupChange: (group: GroupId) => void;
}

export default function PadGrid({
  machineConfig,
  keycaps,
  selectedPad,
  onSelect,
  onUpdate,
  fontFamily,
  activeGroup,
  onGroupChange,
}: Props) {
  const [editingPad, setEditingPad] = useState<FullPadId | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (padId: FullPadId) => {
    setEditingPad(padId);
    setEditValue(keycaps[padId]?.char || '');
  };

  const finishEdit = () => {
    if (editingPad && editValue.length > 0) {
      onUpdate(editingPad, { char: editValue.slice(0, 2) });
    }
    setEditingPad(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') finishEdit();
    else if (e.key === 'Escape') setEditingPad(null);
  };

  return (
    <div className="pad-grid-container">
      {/* Group Tabs */}
      <div className="group-tabs">
        {machineConfig.groups.map((groupId) => (
          <button
            key={groupId}
            className={`group-tab ${activeGroup === groupId ? 'active' : ''}`}
            onClick={() => onGroupChange(groupId)}
            style={{
              borderColor: activeGroup === groupId ? machineConfig.color : 'transparent',
            }}
          >
            {groupId}
          </button>
        ))}
      </div>

      {/* All Groups - shown side by side on wide screens, tabbed on narrow */}
      <div className="groups-container">
        {machineConfig.groups.map((groupId) => (
          <div
            key={groupId}
            className={`group-section ${activeGroup === groupId ? 'active' : 'inactive'}`}
          >
            <div className="group-label">{groupId}</div>
            <div className="pad-grid">
              {machineConfig.gridLayout.map((row, rowIdx) => (
                <div key={rowIdx} className="pad-row">
                  {row.map((padNum) => {
                    const padId = createPadId(groupId, padNum);
                    const keycap = keycaps[padId];
                    const isSelected = selectedPad === padId;
                    const isEditing = editingPad === padId;

                    return (
                      <button
                        key={padId}
                        className={`pad ${isSelected ? 'selected' : ''}`}
                        style={{
                          borderColor: isSelected ? machineConfig.color : 'transparent',
                        }}
                        onClick={() => {
                          if (!isEditing) {
                            onSelect(isSelected ? null : padId);
                          }
                        }}
                        onDoubleClick={() => startEdit(padId)}
                        title={`${groupId}-${padNum}`}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={finishEdit}
                            onKeyDown={handleKeyDown}
                            className="pad-edit-input"
                            autoFocus
                            maxLength={2}
                          />
                        ) : (
                          <>
                            <span
                              className="pad-char"
                              style={{ fontFamily: fontFamily || 'inherit' }}
                            >
                              {keycap?.char || padNum}
                            </span>
                            <span className="pad-number">{padNum}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .pad-grid-container {
          width: 100%;
        }

        .group-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
        }

        .group-tab {
          flex: 1;
          padding: 8px 16px;
          background: #1A1A1A;
          border: 2px solid transparent;
          border-radius: 6px 6px 0 0;
          color: #888;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.15s;
        }

        .group-tab:hover {
          background: #2D2D2D;
          color: #ccc;
        }

        .group-tab.active {
          background: #2D2D2D;
          color: white;
          border-bottom-color: transparent;
        }

        .groups-container {
          display: flex;
          gap: 8px;
        }

        .group-section {
          flex: 1;
          min-width: 0;
          transition: opacity 0.2s;
        }

        .group-section.inactive {
          display: none;
        }

        @media (min-width: 900px) {
          .group-tabs {
            display: none;
          }

          .group-section.inactive {
            display: block;
            opacity: 0.5;
          }

          .group-section.inactive:hover {
            opacity: 0.8;
          }

          .group-section.active {
            opacity: 1;
          }
        }

        .group-label {
          text-align: center;
          font-size: 13px;
          font-weight: bold;
          color: #666;
          margin-bottom: 6px;
          letter-spacing: 1px;
        }

        .pad-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pad-row {
          display: flex;
          gap: 4px;
        }

        .pad {
          flex: 1;
          aspect-ratio: 1;
          background: #333;
          border: 2px solid transparent;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
          position: relative;
          padding: 2px;
          min-width: 0;
        }

        .pad:hover {
          background: #444;
          transform: scale(1.03);
        }

        .pad.selected {
          background: #444;
          transform: scale(1.05);
          box-shadow: 0 0 12px rgba(255, 107, 0, 0.3);
        }

        .pad-char {
          font-size: clamp(14px, 2.5vw, 24px);
          font-weight: bold;
          color: #fff;
          line-height: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .pad-number {
          font-size: 9px;
          color: #555;
          position: absolute;
          bottom: 2px;
          right: 4px;
        }

        .pad-edit-input {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          color: white;
          text-align: center;
          font-size: clamp(14px, 2.5vw, 24px);
          font-weight: bold;
          outline: none;
        }
      `}</style>
    </div>
  );
}
