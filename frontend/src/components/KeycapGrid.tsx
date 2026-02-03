import { useState } from 'react'

interface Keycap {
  id: number
  char: string
  size: number | null
}

interface Props {
  keycaps: Keycap[]
  selectedKeycap: number | null
  onSelect: (id: number | null) => void
  onUpdate: (id: number, char: string) => void
}

export default function KeycapGrid({ keycaps, selectedKeycap, onSelect, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  const startEdit = (keycap: Keycap) => {
    setEditingId(keycap.id)
    setEditValue(keycap.char)
  }

  const finishEdit = () => {
    if (editingId !== null && editValue.length > 0) {
      onUpdate(editingId, editValue.slice(0, 2)) // Max 2 chars
    }
    setEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {keycaps.map((keycap) => (
        <div
          key={keycap.id}
          className={`
            aspect-square rounded-lg flex items-center justify-center
            text-2xl font-bold cursor-pointer transition-all
            ${selectedKeycap === keycap.id
              ? 'bg-te-orange text-white ring-2 ring-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }
          `}
          onClick={() => {
            if (editingId !== keycap.id) {
              onSelect(selectedKeycap === keycap.id ? null : keycap.id)
            }
          }}
          onDoubleClick={() => startEdit(keycap)}
        >
          {editingId === keycap.id ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={finishEdit}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-transparent text-center text-2xl font-bold outline-none"
              autoFocus
              maxLength={2}
            />
          ) : (
            <span>{keycap.char}</span>
          )}
        </div>
      ))}
    </div>
  )
}
