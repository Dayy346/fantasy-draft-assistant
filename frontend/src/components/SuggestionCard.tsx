import { Player } from '../lib/types'
import MetricBadges from './MetricBadges'

interface SuggestionCardProps {
  player: Player
  rank: number
  onSelect: () => void
}

export default function SuggestionCard({ player, rank, onSelect }: SuggestionCardProps) {
  const latestSeason = player.seasons?.[0]

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            {rank}
          </span>
          <div>
            <div className="font-medium text-gray-900">{player.name}</div>
            <div className="text-sm text-gray-600">
              {player.position} • {player.team || 'FA'}
            </div>
          </div>
        </div>
        <button
          onClick={onSelect}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Select
        </button>
      </div>
      
      <div className="mb-3">
        <MetricBadges
          draftScore={latestSeason?.draftScore}
          ppg={latestSeason?.ppg}
          ppt={latestSeason?.ppt}
          vorp={latestSeason?.vorp}
        />
      </div>

      {latestSeason?.isRookie && (
        <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          Rookie • Draft Round {latestSeason.draftRound || 'N/A'}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        Why this pick? High draft score, fills positional need, and strong recent performance.
      </div>
    </div>
  )
}
