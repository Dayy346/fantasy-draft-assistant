interface PositionTabsProps {
  positions: readonly string[]
  selectedPosition: string
  onPositionChange: (position: string) => void
}

export default function PositionTabs({ positions, selectedPosition, onPositionChange }: PositionTabsProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Position</h3>
      <div className="grid grid-cols-2 gap-2">
        {positions.map((position) => (
          <button
            key={position}
            onClick={() => onPositionChange(position)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPosition === position
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {position}
          </button>
        ))}
      </div>
    </div>
  )
}
