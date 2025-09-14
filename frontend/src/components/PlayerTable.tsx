import { Player } from '../lib/types'
import MetricBadges from './MetricBadges'

interface PlayerTableProps {
  players: Player[]
  isLoading: boolean
  searchQuery: string
  onPlayerClick: (player: Player) => void
}

export default function PlayerTable({ players, isLoading, searchQuery, onPlayerClick }: PlayerTableProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchQuery ? 'No players found' : 'No players available'}
        </h3>
        <p className="text-gray-600">
          {searchQuery 
            ? `No players match "${searchQuery}"`
            : 'Try adjusting your filters or check back later.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Player</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Team</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Position</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Draft Score</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">PPG</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">PPT</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">VORP</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const latestSeason = player.seasons?.[0]
              return (
                <tr
                  key={player.id}
                  onClick={() => onPlayerClick(player)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{player.name}</div>
                      {latestSeason?.isRookie && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Rookie
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{player.team || 'FA'}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {player.position}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <MetricBadges
                      draftScore={latestSeason?.draftScore}
                      ppg={latestSeason?.ppg}
                      ppt={latestSeason?.ppt}
                      vorp={latestSeason?.vorp}
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {latestSeason?.ppg?.toFixed(1) || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {latestSeason?.ppt?.toFixed(2) || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {latestSeason?.vorp?.toFixed(1) || '-'}
                  </td>
                  <td className="py-3 px-4">
                    {latestSeason?.isRookie ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Rookie
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Veteran
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
