import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { MockDraftSession, Player } from '../lib/types'

interface MockDraftSetupProps {
  onCreateSession: (params: { numTeams: number; isSnake: boolean; totalRounds: number }) => void
}

function MockDraftSetup({ onCreateSession }: MockDraftSetupProps) {
  const [numTeams, setNumTeams] = useState(12)
  const [isSnake, setIsSnake] = useState(true)
  const [totalRounds, setTotalRounds] = useState(15)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mock Draft</h1>
        <p className="text-xl text-gray-600">
          Draft against AI bots with different strategies
        </p>
      </div>

      <div className="card max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Draft Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Teams
            </label>
            <select
              value={numTeams}
              onChange={(e) => setNumTeams(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 11 }, (_, i) => i + 2).map((num) => (
                <option key={num} value={num}>
                  {num} Teams
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Draft Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="draftType"
                  checked={isSnake}
                  onChange={() => setIsSnake(true)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span>Snake Draft (Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="draftType"
                  checked={!isSnake}
                  onChange={() => setIsSnake(false)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span>Linear Draft</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Rounds
            </label>
            <select
              value={totalRounds}
              onChange={(e) => setTotalRounds(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 16 }, (_, i) => i + 5).map((num) => (
                <option key={num} value={num}>
                  {num} Rounds
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onCreateSession({ numTeams, isSnake, totalRounds })}
            className="w-full btn-primary text-lg py-3"
          >
            Start Mock Draft
          </button>
        </div>
      </div>
    </div>
  )
}

interface MockDraftBoardProps {
  session: MockDraftSession
  onMakePick: (playerId: string) => void
  onBotPick: () => void
  isMakingPick: boolean
}

function MockDraftBoard({ session, onMakePick, onBotPick, isMakingPick }: MockDraftBoardProps) {
  const currentTeam = session.teams.find(t => t.id === session.currentTeam)
  const isHumanTurn = currentTeam?.isHuman

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Draft</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Pick {session.currentPick} of {session.teams.length * session.totalRounds}</span>
          <span>Round {Math.ceil(session.currentPick / session.teams.length)}</span>
          <span>Team {session.currentTeam}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Draft Board</h2>
            
            {isHumanTurn ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Your Turn!</h3>
                <p className="text-blue-700">Select a player to draft</p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {currentTeam?.name} is picking...
                </h3>
                <p className="text-gray-600">
                  Strategy: {currentTeam?.strategy}
                </p>
                <button
                  onClick={onBotPick}
                  disabled={isMakingPick}
                  className="mt-2 btn-secondary"
                >
                  {isMakingPick ? 'Making Pick...' : 'Make Bot Pick'}
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-900">Pick</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-900">Team</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-900">Player</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-900">Position</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-900">Draft Score</th>
                  </tr>
                </thead>
                <tbody>
                  {session.picks.map((pick) => (
                    <tr key={pick.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-600">{pick.pickNumber}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          pick.teamId === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.teams.find(t => t.id === pick.teamId)?.name}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium">{pick.player.name}</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {pick.player.position}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {pick.player.seasons[0]?.draftScore?.toFixed(1) || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Teams</h3>
            <div className="space-y-2">
              {session.teams.map((team) => (
                <div key={team.id} className={`p-3 rounded-lg ${
                  team.id === session.currentTeam ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{team.name}</span>
                    <span className="text-sm text-gray-600">
                      {team.isHuman ? 'Human' : team.strategy}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.entries(team.roster).map(([pos, players]) => (
                      <span key={pos} className="mr-2">
                        {pos}: {players.length}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Your Roster</h3>
            <div className="space-y-2">
              {Object.entries(session.teams[0]?.roster || {}).map(([position, players]) => {
                const needs = session.teams[0]?.needs;
                const positionNeeds = needs ? needs[position as keyof typeof needs] : 0;
                return (
                  <div key={position} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{position}</span>
                    <span className="text-sm text-gray-600">
                      {players.length} / {positionNeeds}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PlayerSelectorProps {
  onSelectPlayer: (player: Player) => void
  isVisible: boolean
  onClose: () => void
}

function PlayerSelector({ onSelectPlayer, isVisible, onClose }: PlayerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<string>('')

  const { data: playersData, isLoading } = useQuery({
    queryKey: ['players', selectedPosition, searchQuery],
    queryFn: () => api.getPlayers({
      position: selectedPosition || undefined,
      sort: 'draftScore',
      order: 'desc',
      limit: 50,
    }),
  })

  const { data: searchResults } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => api.searchPlayers(searchQuery),
    enabled: searchQuery.length > 2,
  })

  const displayPlayers = searchQuery.length > 2 ? searchResults?.players || [] : playersData?.players || []

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Player</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Positions</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="p-6 text-center">Loading players...</div>
          ) : displayPlayers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No players found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {displayPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => {
                    onSelectPlayer(player)
                    onClose()
                  }}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-gray-600">
                        {player.position} • {player.team || 'FA'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {player.seasons[0]?.draftScore?.toFixed(1) || '-'}
                      </div>
                      <div className="text-xs text-gray-500">Draft Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MockDraft() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showPlayerSelector, setShowPlayerSelector] = useState(false)
  const queryClient = useQueryClient()

  const createSessionMutation = useMutation({
    mutationFn: (params: { numTeams: number; isSnake: boolean; totalRounds: number }) =>
      api.createMockDraftSession(params),
    onSuccess: (session) => {
      setSessionId(session.id)
      queryClient.invalidateQueries({ queryKey: ['mockDraft', session.id] })
    },
  })

  const startDraftMutation = useMutation({
    mutationFn: (sessionId: string) => api.startMockDraft(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockDraft', sessionId] })
    },
  })

  const makePickMutation = useMutation({
    mutationFn: ({ playerId, isHuman }: { playerId: string; isHuman: boolean }) =>
      api.makeMockDraftPick(sessionId!, playerId, isHuman),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockDraft', sessionId] })
    },
  })

  const botPickMutation = useMutation({
    mutationFn: () => api.getBotPick(sessionId!),
    onSuccess: async (data) => {
      await makePickMutation.mutateAsync({ playerId: data.playerId, isHuman: false })
    },
  })

  const { data: session, isLoading } = useQuery({
    queryKey: ['mockDraft', sessionId],
    queryFn: () => api.getMockDraftSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 2000, // Refetch every 2 seconds for live updates
  })

  useEffect(() => {
    if (session && session.availablePlayers.length === 0 && !session.isComplete) {
      startDraftMutation.mutate(session.id)
    }
  }, [session])

  if (!sessionId) {
    return <MockDraftSetup onCreateSession={createSessionMutation.mutate} />
  }

  if (isLoading || createSessionMutation.isPending) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Mock Draft</h2>
          <p className="text-gray-600">Setting up your draft session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Draft</h2>
          <p className="text-gray-600 mb-6">Unable to load your mock draft session.</p>
          <button
            onClick={() => setSessionId(null)}
            className="btn-primary"
          >
            Start New Draft
          </button>
        </div>
      </div>
    )
  }

  if (session.isComplete) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <h2 className="text-3xl font-semibold text-green-600 mb-4">Draft Complete!</h2>
          <p className="text-gray-600 mb-6">
            Congratulations! You've completed your mock draft.
          </p>
          <button
            onClick={() => setSessionId(null)}
            className="btn-primary"
          >
            Start New Draft
          </button>
        </div>
      </div>
    )
  }

  const currentTeam = session.teams.find(t => t.id === session.currentTeam)
  const isHumanTurn = currentTeam?.isHuman

  return (
    <>
      <MockDraftBoard
        session={session}
        onMakePick={(playerId) => {
          if (isHumanTurn) {
            makePickMutation.mutate({ playerId, isHuman: true })
          }
        }}
        onBotPick={() => {
          if (!isHumanTurn) {
            botPickMutation.mutate()
          }
        }}
        isMakingPick={makePickMutation.isPending || botPickMutation.isPending}
      />

      {isHumanTurn && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowPlayerSelector(true)}
            className="btn-primary text-lg px-6 py-3 shadow-lg"
          >
            Select Player
          </button>
        </div>
      )}

      <PlayerSelector
        isVisible={showPlayerSelector}
        onClose={() => setShowPlayerSelector(false)}
        onSelectPlayer={(player) => {
          makePickMutation.mutate({ playerId: player.id, isHuman: true })
        }}
      />
    </>
  )
}
