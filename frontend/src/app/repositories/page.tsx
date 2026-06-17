"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRepositories, syncRepositories } from '@/lib/api'
import { FolderGit2, RefreshCw, Server, AlertCircle } from 'lucide-react'

export default function RepositoriesPage() {
  const queryClient = useQueryClient()
  const { data: repos, isLoading, error } = useQuery({ queryKey: ['repositories'], queryFn: getRepositories })
  
  const syncMutation = useMutation({
    mutationFn: syncRepositories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] })
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Repositories</h1>
          <p className="text-muted-foreground">Manage your tracked GitHub repositories and webhook settings.</p>
        </div>
        <button 
          onClick={() => syncMutation.mutate()} 
          disabled={syncMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          {syncMutation.isPending ? 'Syncing...' : 'Sync GitHub'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      ) : error ? (
        <div className="glass p-6 rounded-xl border border-destructive/50 flex items-center text-destructive">
          <AlertCircle className="w-5 h-5 mr-3" />
          Error loading repositories. Please make sure the backend is running.
        </div>
      ) : !repos || repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] glass rounded-2xl border border-border/50">
          <FolderGit2 className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Repositories Tracked</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-center">
            Click the sync button above to fetch repositories that your GitHub App has been installed on.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo: any) => (
            <div key={repo.id} className="glass p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <FolderGit2 className="w-6 h-6 text-primary mr-3" />
                  <div>
                    <h3 className="font-semibold text-white">{repo.display_name || repo.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{repo.full_name}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${repo.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                  {repo.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                {repo.description || 'No description provided.'}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Server className="w-3 h-3 mr-1" />
                Default branch: {repo.default_branch}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
