import type { Keycap } from '../types/machines'

interface Props {
  keycap: Keycap
  defaultSize: number
  defaultDepth: number
  onUpdate: (updates: Partial<Keycap>) => void
  onClose: () => void
}

export default function KeycapEditor({ keycap, defaultSize, defaultDepth, onUpdate, onClose }: Props) {
  const effectiveSize = keycap.size ?? defaultSize
  const effectiveDepth = keycap.depth ?? defaultDepth

  return (
    <div className="bg-te-gray rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-te-orange">
          Edit: {keycap.id} ("{keycap.char}")
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Character */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Character</label>
          <input
            type="text"
            value={keycap.char}
            onChange={(e) => onUpdate({ char: e.target.value.slice(0, 4) })}
            maxLength={4}
            className="w-full bg-gray-700 rounded px-3 py-2 text-white text-center text-xl font-bold"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Size (mm) <span className="text-gray-500">default: {defaultSize}</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={keycap.size ?? ''}
              onChange={(e) => onUpdate({ size: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder={String(defaultSize)}
              step="0.5"
              min="3"
              max="16"
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-white"
            />
            {keycap.size !== null && (
              <button
                onClick={() => onUpdate({ size: null })}
                className="px-3 py-2 bg-gray-600 rounded text-sm hover:bg-gray-500"
                title="Reset to default"
              >
                ↺
              </button>
            )}
          </div>
        </div>

        {/* Depth */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Engrave Depth (mm) <span className="text-gray-500">default: {defaultDepth}</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={keycap.depth ?? ''}
              onChange={(e) => onUpdate({ depth: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder={String(defaultDepth)}
              step="0.1"
              min="0.2"
              max="2.0"
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-white"
            />
            {keycap.depth !== null && (
              <button
                onClick={() => onUpdate({ depth: null })}
                className="px-3 py-2 bg-gray-600 rounded text-sm hover:bg-gray-500"
                title="Reset to default"
              >
                ↺
              </button>
            )}
          </div>
        </div>

        {/* Offset X */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            X Offset (mm) <span className="text-gray-500">← left / right →</span>
          </label>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onUpdate({ offsetX: keycap.offsetX - 0.25 })}
              className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-500"
            >
              ←
            </button>
            <input
              type="number"
              value={keycap.offsetX}
              onChange={(e) => onUpdate({ offsetX: parseFloat(e.target.value) || 0 })}
              step="0.25"
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-white text-center"
            />
            <button
              onClick={() => onUpdate({ offsetX: keycap.offsetX + 0.25 })}
              className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-500"
            >
              →
            </button>
            {keycap.offsetX !== 0 && (
              <button
                onClick={() => onUpdate({ offsetX: 0 })}
                className="px-2 py-2 bg-gray-600 rounded text-sm hover:bg-gray-500"
                title="Reset"
              >
                ↺
              </button>
            )}
          </div>
        </div>

        {/* Offset Y */}
        <div className="col-span-2">
          <label className="block text-sm text-gray-400 mb-1">
            Y Offset (mm) <span className="text-gray-500">↓ down / up ↑</span>
          </label>
          <div className="flex gap-2 items-center max-w-xs">
            <button
              onClick={() => onUpdate({ offsetY: keycap.offsetY - 0.25 })}
              className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-500"
            >
              ↓
            </button>
            <input
              type="number"
              value={keycap.offsetY}
              onChange={(e) => onUpdate({ offsetY: parseFloat(e.target.value) || 0 })}
              step="0.25"
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-white text-center"
            />
            <button
              onClick={() => onUpdate({ offsetY: keycap.offsetY + 0.25 })}
              className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-500"
            >
              ↑
            </button>
            {keycap.offsetY !== 0 && (
              <button
                onClick={() => onUpdate({ offsetY: 0 })}
                className="px-2 py-2 bg-gray-600 rounded text-sm hover:bg-gray-500"
                title="Reset"
              >
                ↺
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Effective values: Size <span className="text-white">{effectiveSize}mm</span>,
          Depth <span className="text-white">{effectiveDepth}mm</span>,
          Offset <span className="text-white">({keycap.offsetX}, {keycap.offsetY})</span>
        </p>
      </div>
    </div>
  )
}
