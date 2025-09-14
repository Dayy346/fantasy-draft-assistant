import { DraftPick } from '../lib/types'

interface DraftBoardProps {
  picks: DraftPick[]
  onUndoPick: (pickId: string) => void
}

export default function DraftBoard({ picks, onUndoPick }: DraftBoardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Draft Board</h3>
        <div className="text-sm text-gray-600">
          {picks.length} picks made
        </div>
      </div>

      {picks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No picks made yet</p>
          <p className="text-sm">Start by selecting a player below</p>
        </div>
      ) : (
        <div className="space-y-3">
          {picks.map((pick) => (
            <div
              key={pick.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {pick.pickNumber}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{pick.player.name}</div>
                  <div className="text-sm text-gray-600">
                    {pick.player.position} • {pick.player.team || 'FA'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {pick.teamSlot && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {pick.teamSlot}
                  </span>
                )}
                <button
                  onClick={() => onUndoPick(pick.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Undo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
