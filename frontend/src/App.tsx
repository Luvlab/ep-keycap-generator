import { useState } from 'react'
import KeycapGrid from './components/KeycapGrid'
import SettingsPanel from './components/SettingsPanel'
import FontUploader from './components/FontUploader'

interface Keycap {
  id: number
  char: string
  size: number | null // null = use default
}

const DEFAULT_KEYCAPS: Keycap[] = [
  { id: 0, char: '0', size: null },
  { id: 1, char: '1', size: null },
  { id: 2, char: '2', size: null },
  { id: 3, char: '3', size: null },
  { id: 4, char: '4', size: null },
  { id: 5, char: '5', size: null },
  { id: 6, char: '6', size: null },
  { id: 7, char: '7', size: null },
  { id: 8, char: '8', size: null },
  { id: 9, char: '9', size: null },
  { id: 10, char: '+', size: null },
  { id: 11, char: '-', size: null },
  { id: 12, char: 'D', size: null },
  { id: 13, char: 'B', size: null },
  { id: 14, char: 'K', size: null },
  { id: 15, char: 'X', size: null },
  { id: 16, char: 'E', size: null },
  { id: 17, char: 'C', size: null },
  { id: 18, char: 'S', size: null },
  { id: 19, char: 'R', size: null },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [keycaps, setKeycaps] = useState<Keycap[]>(DEFAULT_KEYCAPS)
  const [selectedFont, setSelectedFont] = useState<string>('digitalix.ttf')
  const [defaultSize, setDefaultSize] = useState<number>(12)
  const [engraveDepth, setEngraveDepth] = useState<number>(0.8)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [selectedKeycap, setSelectedKeycap] = useState<number | null>(null)

  const updateKeycap = (id: number, char: string) => {
    setKeycaps(keycaps.map(k => k.id === id ? { ...k, char } : k))
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
            size: k.size || defaultSize,
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
        <div className="lg:col-span-2">
          <div className="bg-te-gray rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-te-orange">Keycaps (4x5 Grid)</h2>
            <KeycapGrid
              keycaps={keycaps}
              selectedKeycap={selectedKeycap}
              onSelect={setSelectedKeycap}
              onUpdate={updateKeycap}
            />
          </div>
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
          <a href="https://github.com/BreakinBreadSwe/ep-keycap-generator"
             className="text-te-orange hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
