import { useState, useEffect, useCallback } from 'react'

interface Props {
  selectedFont: string
  onFontSelect: (font: string) => void
  apiUrl: string
}

export default function FontUploader({ selectedFont, onFontSelect, apiUrl }: Props) {
  const [fonts, setFonts] = useState<string[]>(['digitalix.ttf'])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const fetchFonts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/fonts`)
      if (response.ok) {
        const data = await response.json()
        if (data.fonts && data.fonts.length > 0) {
          setFonts(data.fonts)
        }
      }
    } catch (error) {
      console.log('Could not fetch fonts from API')
    }
  }, [apiUrl])

  useEffect(() => {
    fetchFonts()
  }, [fetchFonts])

  const uploadFont = async (file: File) => {
    if (!file.name.match(/\.(ttf|otf)$/i)) {
      alert('Please upload a .ttf or .otf font file')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${apiUrl}/fonts`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchFonts()
        onFontSelect(file.name)
      } else {
        alert('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Could not connect to API server')
    }

    setIsUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFont(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFont(file)
  }

  return (
    <div className="bg-te-gray rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-te-orange">Font</h2>

      {/* Font Selector */}
      <select
        value={selectedFont}
        onChange={(e) => onFontSelect(e.target.value)}
        className="w-full p-3 bg-gray-700 rounded-lg text-white mb-4 cursor-pointer"
      >
        {fonts.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors
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
          className="cursor-pointer text-gray-400 hover:text-white"
        >
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              <span className="text-te-orange">Upload font</span>
              <br />
              <span className="text-sm">or drag & drop .ttf/.otf</span>
            </>
          )}
        </label>
      </div>
    </div>
  )
}
