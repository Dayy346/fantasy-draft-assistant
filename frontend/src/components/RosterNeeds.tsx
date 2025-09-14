import { RosterNeeds as RosterNeedsType } from '../lib/types'

interface RosterNeedsProps {
  needs: RosterNeedsType
}

const POSITION_LABELS = {
  QB: 'Quarterback',
  RB: 'Running Back',
  WR: 'Wide Receiver',
  TE: 'Tight End',
}

const POSITION_COLORS = {
  QB: 'bg-blue-100 text-blue-800',
  RB: 'bg-green-100 text-green-800',
  WR: 'bg-purple-100 text-purple-800',
  TE: 'bg-orange-100 text-orange-800',
}

export default function RosterNeeds({ needs }: RosterNeedsProps) {
  const getNeedLevel = (count: number) => {
    if (count <= 1) return { level: 'Critical', color: 'text-red-600' }
    if (count <= 2) return { level: 'High', color: 'text-orange-600' }
    if (count <= 3) return { level: 'Medium', color: 'text-yellow-600' }
    return { level: 'Low', color: 'text-green-600' }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Roster Needs</h3>
      
      <div className="space-y-3">
        {Object.entries(needs).map(([position, count]) => {
          const { level, color } = getNeedLevel(count)
          return (
            <div key={position} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${POSITION_COLORS[position as keyof typeof POSITION_COLORS]}`}>
                  {position}
                </span>
                <span className="text-sm text-gray-600">
                  {POSITION_LABELS[position as keyof typeof POSITION_LABELS]}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${color}`}>
                  {level}
                </div>
                <div className="text-xs text-gray-500">
                  {count} players
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Tip:</strong> Focus on positions with "Critical" or "High" needs first. 
          The suggestion algorithm prioritizes these positions.
        </div>
      </div>
    </div>
  )
}
