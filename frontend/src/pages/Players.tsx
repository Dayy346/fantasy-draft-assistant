import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import PositionTabs from '../components/PositionTabs'
import Filters from '../components/Filters'
import PlayerTable from '../components/PlayerTable'
import { Player } from '../lib/types'

const POSITIONS = ['QB', 'RB', 'WR', 'TE'] as const

export default function Players() {
  const [selectedPosition, setSelectedPosition] = useState<string>('RB')
  const [sortBy, setSortBy] = useState<string>('draftScore')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [includeRookies, setIncludeRookies] = useState(true)

  const { data: playersData, isLoading, error } = useQuery({
    queryKey: ['players', selectedPosition, sortBy, sortOrder, page, searchQuery, includeRookies],
    queryFn: () => api.getPlayers({
      position: selectedPosition,
      sort: sortBy,
      order: sortOrder,
      page,
      limit: 50,
    }),
  })

  const { data: searchResults } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => api.searchPlayers(searchQuery),
    enabled: searchQuery.length > 2,
  })

  const displayPlayers = searchQuery.length > 2 ? searchResults?.players || [] : playersData?.players || []

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Players</h2>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Player Analytics</h1>
        <p className="text-gray-600">
          Explore player statistics with advanced metrics and transparent scoring
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <PositionTabs
              positions={POSITIONS}
              selectedPosition={selectedPosition}
              onPositionChange={setSelectedPosition}
            />
            
            <Filters
              sortBy={sortBy}
              sortOrder={sortOrder}
              includeRookies={includeRookies}
              searchQuery={searchQuery}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onIncludeRookiesChange={setIncludeRookies}
              onSearchQueryChange={setSearchQuery}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <PlayerTable
            players={displayPlayers}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onPlayerClick={(player: Player) => {
              // TODO: Open player detail modal
              console.log('Player clicked:', player)
            }}
          />
          
          {!searchQuery && playersData && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, playersData.total)} of {playersData.total} players
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!playersData || page * 50 >= playersData.total}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
