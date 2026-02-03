import { useState } from 'react'
import KeycapGrid from './components/KeycapGrid'
import SettingsPanel from './components/SettingsPanel'
import FontUploader from './components/FontUploader'
import KeycapEditor from './components/KeycapEditor'

export interface Keycap {
  id: number
  char: string
  size: number | null      // null = use default
  offsetX: number          // manual X centering offset (mm)
  offsetY: number          // manual Y centering offset (mm)
  depth: number | null     // null = use default
}

const DEFAULT_KEYCAPS: Keycap[] = [
  { id: 0, char: '0', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 1, char: '1', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 2, char: '2', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 3, char: '3', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 4, char: '4', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 5, char: '5', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 6, char: '6', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 7, char: '7', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 8, char: '8', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 9, char: '9', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 10, char: '+', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 11, char: '-', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 12, char: 'D', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 13, char: 'B', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 14, char: 'K', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 15, char: 'X', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 16, char: 'E', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 17, char: 'C', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 18, char: 'S', size: null, offsetX: 0, offsetY: 0, depth: null },
  { id: 19, char: 'R', size: null, offsetX: 0, offsetY: 0, depth: null },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [keycaps, setKeycaps] = useState<Keycap[]>(DEFAULT_KEYCAPS)
  const [selectedFont, setSelectedFont] = useState<string>('digitalix.ttf')
  const [defaultSize, setDefaultSize] = useState<number>(10)
  const [engraveDepth, setEngraveDepth] = useState<number>(0.8)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [selectedKeycap, setSelectedKeycap] = useState<number | null>(null)

  const updateKeycap = (id: number, updates: Partial<Keycap>) => {
    setKeycaps(keycaps.map(k => k.id === id ? { ...k, ...updates } : k))
  }

  const generateSTLs = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keycaps: keycaps.map(k => ({
            id: k.id,
            char: k.char,
            size: k.size ?? defaultSize,
            offset_x: k.offsetX,
            offset_y: k.offsetY,
            depth: k.depth ?? engraveDepth,
          })),
          font: selectedFont,
          engrave_depth: engraveDepth,
          default_size: defaultSize,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'keycaps.zip'
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Generation failed. Check API server.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Could not connect to API server.')
    }
    setIsGenerating(false)
  }

  const selectedKeycapData = selectedKeycap !== null
    ? keycaps.find(k => k.id === selectedKeycap)
    : null

  return (
    <div className="min-h-screen bg-te-dark p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-te-orange mb-2">
          EP Keycap Generator
        </h1>
        <p className="text-gray-400">
          Customize and generate 3D printable keycaps for Teenage Engineering EP-series
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Keycap Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-te-gray rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-te-orange">Keycaps (4x5 Grid)</h2>
            <p className="text-sm text-gray-400 mb-4">Click to select, double-click to edit character</p>
            <KeycapGrid
              keycaps={keycaps}
              selectedKeycap={selectedKeycap}
              onSelect={setSelectedKeycap}
              onUpdate={(id, char) => updateKeycap(id, { char })}
            />
          </div>

          {/* Per-Keycap Editor (shows when selected) */}
          {selectedKeycapData && (
            <KeycapEditor
              keycap={selectedKeycapData}
              defaultSize={defaultSize}
              defaultDepth={engraveDepth}
              onUpdate={(updates) => updateKeycap(selectedKeycapData.id, updates)}
              onClose={() => setSelectedKeycap(null)}
            />
          )}
        </div>

        {/* Right: Settings */}
        <div className="space-y-6">
          <FontUploader
            selectedFont={selectedFont}
            onFontSelect={setSelectedFont}
            apiUrl={API_URL}
          />

          <SettingsPanel
            defaultSize={defaultSize}
            engraveDepth={engraveDepth}
            onSizeChange={setDefaultSize}
            onDepthChange={setEngraveDepth}
          />

          {/* Generate Button */}
          <button
            onClick={generateSTLs}
            disabled={isGenerating}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isGenerating
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-te-orange hover:bg-orange-600 cursor-pointer'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate STL Files'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            Downloads a ZIP with 20 STL files for 3D printing
          </p>
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>For Teenage Engineering EP-133 / EP-1320 / EP-2350</p>
        <p className="mt-1">
          <a href="https://github.com/Luvlab/ep-keycap-generator"
             className="text-te-orange hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
