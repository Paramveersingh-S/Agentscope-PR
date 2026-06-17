import { create } from 'zustand'

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Finding {
  id: string
  title: string
  description: string
  severity: string
  file_path: string
  line_start?: number
  line_end?: number
  code_snippet?: string
  agent_name: string
  duplicate_of?: string
}

export interface ReviewState {
  isConnected: boolean
  activeAgents: Record<string, AgentStatus>
  liveFindings: Finding[]
  setIsConnected: (status: boolean) => void
  updateAgentStatus: (agent: string, status: AgentStatus) => void
  addFinding: (finding: Finding) => void
  resetReview: () => void
}

export const useReviewStore = create<ReviewState>((set) => ({
  isConnected: false,
  activeAgents: {
    security: 'pending',
    performance: 'pending',
    code_quality: 'pending',
    test_coverage: 'pending',
    documentation: 'pending',
    dependency: 'pending'
  },
  liveFindings: [],
  setIsConnected: (status) => set({ isConnected: status }),
  updateAgentStatus: (agent, status) => set((state) => ({
    activeAgents: { ...state.activeAgents, [agent]: status }
  })),
  addFinding: (finding) => set((state) => {
    // Basic dedup by ID just in case
    if (state.liveFindings.some(f => f.id === finding.id)) return state;
    return { liveFindings: [...state.liveFindings, finding] }
  }),
  resetReview: () => set({
    isConnected: false,
    liveFindings: [],
    activeAgents: {
      security: 'pending',
      performance: 'pending',
      code_quality: 'pending',
      test_coverage: 'pending',
      documentation: 'pending',
      dependency: 'pending'
    }
  })
}))
