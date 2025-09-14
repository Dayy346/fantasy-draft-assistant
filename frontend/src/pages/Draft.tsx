import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import DraftBoard from '../components/DraftBoard'
import PickInput from '../components/PickInput'
import SuggestionCard from '../components/SuggestionCard'
import RosterNeeds from '../components/RosterNeeds'

interface DraftProps {
  sessionId: string | null
}

export default function Draft({ sessionId: initialSessionId }: DraftProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId)
  const queryClient = useQueryClient()

  const createSessionMutation = useMutation({
    mutationFn: () => api.createDraftSession(),
    onSuccess: (data) => {
      setSessionId(data.sessionId)
    },
  })

  const { data: draftSession, isLoading } = useQuery({
    queryKey: ['draft', sessionId],
    queryFn: () => api.getDraftSession(sessionId!),
    enabled: !!sessionId,
  })

  const makePickMutation = useMutation({
    mutationFn: ({ playerId, teamSlot }: { playerId: string; teamSlot?: string }) =>
      api.makePick(sessionId!, playerId, teamSlot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', sessionId] })
    },
  })

  useEffect(() => {
    if (!sessionId) {
      createSessionMutation.mutate()
    }
  }, [sessionId])

  if (isLoading || createSessionMutation.isPending) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Draft Session</h2>
          <p className="text-gray-600">Setting up your draft assistant...</p>
        </div>
      </div>
    )
  }

  if (!draftSession) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Draft</h2>
          <p className="text-gray-600 mb-6">Unable to load your draft session.</p>
          <button
            onClick={() => createSessionMutation.mutate()}
            className="btn-primary"
            disabled={createSessionMutation.isPending}
          >
            {createSessionMutation.isPending ? 'Creating...' : 'Create New Session'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Draft Assistant</h1>
        <p className="text-gray-600">
          Real-time suggestions based on your roster needs and remaining players
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DraftBoard
            picks={draftSession.picks}
            onUndoPick={(pickId) => {
              // TODO: Implement undo functionality
              console.log('Undo pick:', pickId)
            }}
          />
          
          <PickInput
            onPlayerSelect={(playerId, teamSlot) => {
              makePickMutation.mutate({ playerId, teamSlot })
            }}
            isMakingPick={makePickMutation.isPending}
          />
        </div>

        <div className="space-y-6">
          <RosterNeeds needs={draftSession.rosterNeeds} />
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Top Suggestions</h3>
            <div className="space-y-3">
              {draftSession.suggestions.slice(0, 5).map((player, index) => (
                <SuggestionCard
                  key={player.id}
                  player={player}
                  rank={index + 1}
                  onSelect={() => {
                    makePickMutation.mutate({ playerId: player.id })
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
