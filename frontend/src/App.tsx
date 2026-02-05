import { useState, useEffect } from 'react'
import MachineSelector from './components/MachineSelector'
import PadGrid from './components/PadGrid'
import SettingsPanel from './components/SettingsPanel'
import FontUploader from './components/FontUploader'
import KeycapEditor from './components/KeycapEditor'
import { useMidiDetection } from './hooks/useMidiDetection'
import {
  MACHINE_CONFIGS,
  createDefaultKeycaps,
  getTotalPads,
  type MachineType,
  type GroupId,
  type FullPadId,
  type Keycap,
} from './types/machines'

// Re-export Keycap type for components that need it
export type { Keycap } from './types/machines'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  // Machine selection
  const [selectedMachine, setSelectedMachine] = useState<MachineType>('EP-133')
  const { detectedMachine, isSupported: midiSupported } = useMidiDetection()

  // Auto-select detected machine
  useEffect(() => {
    if (detectedMachine) {
      setSelectedMachine(detectedMachine)
    }
  }, [detectedMachine])

  const machineConfig = MACHINE_CONFIGS[selectedMachine]

  // Keycap state (keyed by FullPadId)
  const [keycaps, setKeycaps] = useState<Record<FullPadId, Keycap>>(
    createDefaultKeycaps(machineConfig)
  )

  // Re-create keycaps when machine changes
  useEffect(() => {
    setKeycaps(createDefaultKeycaps(MACHINE_CONFIGS[selectedMachine]))
    setSelectedPad(null)
    setActiveGroup('A')
  }, [selectedMachine])

  // Font state
  const [selectedFontName, setSelectedFontName] = useState<string>('Default (System)')
  const [fontFamily, setFontFamily] = useState<string>('inherit')

  // Settings
  const [defaultSize, setDefaultSize] = useState<number>(10)
  const [engraveDepth, setEngraveDepth] = useState<number>(0.8)

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [selectedPad, setSelectedPad] = useState<FullPadId | null>(null)
  const [activeGroup, setActiveGroup] = useState<GroupId>('A')

  // Update a single keycap
  const updateKeycap = (padId: FullPadId, updates: Partial<Keycap>) => {
    setKeycaps(prev => ({
      ...prev,
      [padId]: { ...prev[padId], ...updates },
    }))
  }

  // Font selection callback
  const handleFontSelect = (fontName: string, family: string) => {
    setSelectedFontName(fontName)
    setFontFamily(family)
  }

  // Generate STLs
  const generateSTLs = async () => {
    setIsGenerating(true)
    try {
      const keycapList = Object.values(keycaps).map((k, idx) => ({
        id: idx,
        char: k.char,
        size: k.size ?? defaultSize,
        offset_x: k.offsetX,
        offset_y: k.offsetY,
        depth: k.depth ?? engraveDepth,
      }))

      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keycaps: keycapList,
          font: selectedFontName,
          engrave_depth: engraveDepth,
          default_size: defaultSize,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `keycaps_${selectedMachine.toLowerCase()}.zip`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Generation failed. Check API server.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Could not connect to API server. Make sure the backend is running.')
    }
    setIsGenerating(false)
  }

  const selectedKeycapData = selectedPad ? keycaps[selectedPad] : null
  const totalPads = getTotalPads(machineConfig)

  return (
    <div className="min-h-screen bg-te-dark p-4 md:p-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-te-orange mb-1">
          EP Keycap Generator
        </h1>
        <p className="text-gray-500 text-sm">
          Custom 3D printable keycaps for Teenage Engineering EP-series
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Machine + Grid */}
        <div className="lg:col-span-3 space-y-4">
          <MachineSelector
            selectedMachine={selectedMachine}
            detectedMachine={detectedMachine}
            onSelect={setSelectedMachine}
            midiSupported={midiSupported}
          />

          <div className="bg-te-gray rounded-lg p-4 md:p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-te-orange">
                {machineConfig.name} — Pads
              </h2>
              <span className="text-sm text-gray-500">
                {totalPads} keycaps · click to select · double-click to edit
              </span>
            </div>

            <PadGrid
              machineConfig={machineConfig}
              keycaps={keycaps}
              selectedPad={selectedPad}
              onSelect={setSelectedPad}
              onUpdate={updateKeycap}
              fontFamily={fontFamily}
              activeGroup={activeGroup}
              onGroupChange={setActiveGroup}
            />
          </div>

          {/* Per-Keycap Editor (shows when selected) */}
          {selectedKeycapData && selectedPad && (
            <KeycapEditor
              keycap={selectedKeycapData}
              defaultSize={defaultSize}
              defaultDepth={engraveDepth}
              onUpdate={(updates) => updateKeycap(selectedPad, updates)}
              onClose={() => setSelectedPad(null)}
            />
          )}
        </div>

        {/* Right: Settings Panel */}
        <div className="space-y-4">
          <FontUploader
            selectedFont={selectedFontName}
            onFontSelect={handleFontSelect}
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
            {isGenerating ? 'Generating...' : `Generate ${totalPads} STLs`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Downloads ZIP with {totalPads} STL files for 3D printing
          </p>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-600 text-xs">
        <p>
          <a href="https://github.com/Luvlab/ep-keycap-generator"
             className="text-te-orange hover:underline">
            GitHub
          </a>
          {' · '}
          For T.E. EP-133 / EP-1320 / EP-2350 / EP-40
        </p>
      </footer>
    </div>
  )
}

export default App
