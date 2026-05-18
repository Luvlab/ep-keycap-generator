import { useState, useEffect } from 'react'

interface FontEntry {
  name: string;
  fontFamily: string; // CSS font-family name
  objectUrl?: string; // Blob URL for locally loaded fonts
  isLocal: boolean;   // Whether loaded client-side or from API
}

interface Props {
  selectedFont: string
  onFontSelect: (fontName: string, fontFamily: string) => void
  apiUrl: string
}

export default function FontUploader({ selectedFont, onFontSelect, apiUrl }: Props) {
  const [fonts, setFonts] = useState<FontEntry[]>([
    { name: 'Default (System)', fontFamily: 'inherit', isLocal: true },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Check if API is available
  useEffect(() => {
    fetch(`${apiUrl}/fonts`)
      .then((res) => {
        if (res.ok) {
          setApiAvailable(true)
          return res.json()
        }
        return null
      })
      .then((data) => {
        if (data?.fonts) {
          const apiEntries: FontEntry[] = data.fonts.map((f: string) => ({
            name: f,
            fontFamily: `api-font-${f.replace(/\.\w+$/, '')}`,
            isLocal: false,
          }))
          setFonts((prev) => {
            const localFonts = prev.filter(f => f.isLocal)
            return [...localFonts, ...apiEntries]
          })
        }
      })
      .catch(() => {
        console.log('API not available - using client-side font loading only')
      })
  }, [apiUrl])

  /**
   * Load a font file directly in the browser using FontFace API.
   * This allows font preview even without a backend server.
   */
  const loadFontLocally = async (file: File) => {
    if (!file.name.match(/\.(ttf|otf)$/i)) {
      alert('Please upload a .ttf or .otf font file')
      return
    }

    setIsUploading(true)
    setLoadError(null)

    try {
      // Create object URL from font file
      const objectUrl = URL.createObjectURL(file)
      const fontName = file.name.replace(/\.\w+$/, '')
      const fontFamily = `custom-${fontName}-${Date.now()}`

      // Load font using FontFace API
      const fontFace = new FontFace(fontFamily, `url(${objectUrl})`)
      await fontFace.load()
      document.fonts.add(fontFace)

      console.log(`[Font] Loaded: ${fontName} as ${fontFamily}`)

      const entry: FontEntry = {
        name: file.name,
        fontFamily,
        objectUrl,
        isLocal: true,
      }

      setFonts((prev) => [...prev, entry])
      onFontSelect(file.name, fontFamily)

      // Also try uploading to API if available
      if (apiAvailable) {
        const formData = new FormData()
        formData.append('file', file)
        try {
          await fetch(`${apiUrl}/fonts`, {
            method: 'POST',
            body: formData,
          })
        } catch {
          // API upload is optional
        }
      }
    } catch (error) {
      console.error('[Font] Load error:', error)
      setLoadError('Could not load font file. It may be corrupted.')
    }

    setIsUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFontLocally(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFontLocally(file)
  }

  const handleFontSelect = (fontName: string) => {
    const entry = fonts.find(f => f.name === fontName)
    if (entry) {
      onFontSelect(entry.name, entry.fontFamily)
    }
  }

  return (
    <div className="bg-te-gray rounded-lg p-5">
      <h2 className="text-lg font-semibold mb-3 text-te-orange">Font</h2>

      {/* Font Selector */}
      <select
        value={selectedFont}
        onChange={(e) => handleFontSelect(e.target.value)}
        className="w-full p-2 bg-gray-700 rounded text-white mb-3 cursor-pointer text-sm"
      >
        {fonts.map((font) => (
          <option key={font.name} value={font.name}>
            {font.name}
          </option>
        ))}
      </select>

      {/* Font Preview */}
      {selectedFont !== 'Default (System)' && (
        <div className="mb-3 bg-gray-700 rounded p-3 text-center">
          <span
            className="text-2xl text-white"
            style={{
              fontFamily: fonts.find(f => f.name === selectedFont)?.fontFamily || 'inherit'
            }}
          >
            0123456789+-
          </span>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-3 text-center transition-colors
          ${isDragging ? 'border-te-orange bg-orange-900/20' : 'border-gray-600'}
          ${isUploading ? 'opacity-50' : ''}
        `}
      >
        <input
          type="file"
          accept=".ttf,.otf"
          onChange={handleFileInput}
          className="hidden"
          id="font-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="font-upload"
          className="cursor-pointer text-gray-400 hover:text-white text-sm"
        >
          {isUploading ? (
            'Loading font...'
          ) : (
            <>
              <span className="text-te-orange">Upload font</span>
              {' '}
              <span className="text-xs">(.ttf / .otf)</span>
            </>
          )}
        </label>
      </div>

      {loadError && (
        <p className="text-xs text-red-400 mt-2">{loadError}</p>
      )}
    </div>
  )
}
