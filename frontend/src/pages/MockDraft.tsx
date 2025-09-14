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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mock Draft
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Draft against AI bots with different strategies and build your championship team
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-semibold mb-6">Draft Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Teams
            </label>
            <select
              value={numTeams}
              onChange={(e) => setNumTeams(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
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
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all duration-200">
                <input
                  type="radio"
                  name="draftType"
                  checked={isSnake}
                  onChange={() => setIsSnake(true)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <div className="font-medium">Snake Draft</div>
                  <div className="text-sm text-gray-500">Recommended</div>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all duration-200">
                <input
                  type="radio"
                  name="draftType"
                  checked={!isSnake}
                  onChange={() => setIsSnake(false)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <div className="font-medium">Linear Draft</div>
                  <div className="text-sm text-gray-500">Traditional</div>
                </div>
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🚀 Start Mock Draft
          </button>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mock Draft
          </h1>
          <div className="flex items-center space-x-6 text-sm">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="font-semibold text-gray-900">Pick {session.currentPick}</span>
              <span className="text-gray-600"> of {session.teams.length * session.totalRounds}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="font-semibold text-gray-900">Round {Math.ceil(session.currentPick / session.teams.length)}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="font-semibold text-gray-900">Team {session.currentTeam}</span>
            </div>
          </div>
        </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Draft Board</h2>
            
            {isHumanTurn ? (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-xl font-bold mb-2">🎯 Your Turn!</h3>
                <p className="text-blue-100">Select a player to draft</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-xl font-bold mb-2">
                  🤖 {currentTeam?.name} is picking...
                </h3>
                <p className="text-gray-100 mb-4">
                  Strategy: {currentTeam?.strategy}
                </p>
                <button
                  onClick={onBotPick}
                  disabled={isMakingPick}
                  className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                >
                  {isMakingPick ? 'Making Pick...' : 'Make Bot Pick'}
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Pick</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Team</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Player</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Position</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Draft Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {session.picks.map((pick) => (
                    <tr key={pick.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-gray-600 font-medium">{pick.pickNumber}</td>
                      <td className="py-4 px-4">
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Teams</h3>
            <div className="space-y-3">
              {session.teams.map((team) => (
                <div key={team.id} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  team.id === session.currentTeam 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{team.name}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      team.isHuman 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {team.isHuman ? 'Human' : team.strategy}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(team.roster).map(([pos, players]) => (
                      <span key={pos} className="px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-600 border border-gray-200">
                        {pos}: {players.length}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Your Roster</h3>
            <div className="space-y-4">
              {Object.entries(session.teams[0]?.roster || {}).map(([position, playerIds]) => {
                const needs = session.teams[0]?.needs;
                const positionNeeds = needs ? needs[position as keyof typeof needs] : 0;
                const isComplete = playerIds.length >= positionNeeds;
                
                // Get player details from picks
                const players = playerIds.map(playerId => 
                  session.picks.find(pick => pick.playerId === playerId)?.player
                ).filter(Boolean);
                
                return (
                  <div key={position} className={`p-4 rounded-xl border-2 ${
                    isComplete 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{position}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isComplete 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {playerIds.length} / {positionNeeds}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {players.map((player, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                          <span className="font-medium text-gray-900">{player?.name}</span>
                          <span className="text-sm text-gray-600">{player?.position}</span>
                        </div>
                      ))}
                      {playerIds.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No {position} selected yet
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Select Player
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              ✕
            </button>
          </div>
          
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 min-w-[150px]"
            >
              <option value="">All Positions</option>
              <option value="QB">🏈 QB</option>
              <option value="RB">🏃 RB</option>
              <option value="WR">🎯 WR</option>
              <option value="TE">📡 TE</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto max-h-96 p-4">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading players...</div>
            </div>
          ) : displayPlayers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <div>No players found</div>
            </div>
          ) : (
            <div className="space-y-2">
              {displayPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => {
                    onSelectPlayer(player)
                    onClose()
                  }}
                  className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{player.name}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-2">
                          <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                            {player.position}
                          </span>
                          <span>•</span>
                          <span>{player.team || 'FA'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {player.seasons[0]?.draftScore?.toFixed(1) || '-'}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Draft Score</div>
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
