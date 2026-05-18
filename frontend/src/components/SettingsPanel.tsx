interface Props {
  defaultSize: number
  engraveDepth: number
  onSizeChange: (size: number) => void
  onDepthChange: (depth: number) => void
}

export default function SettingsPanel({
  defaultSize,
  engraveDepth,
  onSizeChange,
  onDepthChange,
}: Props) {
  return (
    <div className="bg-te-gray rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-te-orange">Settings</h2>

      <div className="space-y-4">
        {/* Text Size */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Text Size: {defaultSize}mm
          </label>
          <input
            type="range"
            min="6"
            max="14"
            step="0.5"
            value={defaultSize}
            onChange={(e) => onSizeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-te-orange"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6mm</span>
            <span>14mm</span>
          </div>
        </div>

        {/* Engrave Depth */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Engrave Depth: {engraveDepth}mm
          </label>
          <input
            type="range"
            min="0.4"
            max="1.2"
            step="0.1"
            value={engraveDepth}
            onChange={(e) => onDepthChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-te-orange"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.4mm</span>
            <span>1.2mm</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-gray-800 rounded text-sm text-gray-400">
        <p className="font-semibold text-white mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Double-click a keycap to edit its character</li>
          <li>Use 0.8mm depth for best color-change printing</li>
          <li>Text size 10-12mm works well for most fonts</li>
        </ul>
      </div>
    </div>
  )
}
