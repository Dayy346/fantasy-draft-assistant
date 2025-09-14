import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface PickInputProps {
  onPlayerSelect: (playerId: string, teamSlot?: string) => void
  isMakingPick: boolean
}

export default function PickInput({ onPlayerSelect, isMakingPick }: PickInputProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [teamSlot, setTeamSlot] = useState('')

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => api.searchPlayers(searchQuery),
    enabled: searchQuery.length > 2,
  })

  const handlePlayerSelect = (playerId: string) => {
    onPlayerSelect(playerId, teamSlot || undefined)
    setSearchQuery('')
    setTeamSlot('')
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Make a Pick</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Player
          </label>
          <input
            type="text"
            placeholder="Type player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Slot (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Team 1, Team A, etc."
            value={teamSlot}
            onChange={(e) => setTeamSlot(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {searchQuery.length > 2 && (
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Searching...
              </div>
            ) : searchResults?.players.length ? (
              <div className="divide-y divide-gray-200">
                {searchResults.players.slice(0, 10).map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerSelect(player.id)}
                    disabled={isMakingPick}
                    className="w-full p-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-gray-900">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      {player.position} • {player.team || 'FA'}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No players found
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => {
            if (searchResults?.players.length === 1) {
              handlePlayerSelect(searchResults.players[0].id)
            }
          }}
          disabled={!searchResults?.players.length || searchResults.players.length !== 1 || isMakingPick}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMakingPick ? 'Making Pick...' : 'Select Player'}
        </button>
      </div>
    </div>
  )
}
