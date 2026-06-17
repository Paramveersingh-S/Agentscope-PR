// API utility for frontend
export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `/api/v1${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Repositories
export const syncRepositories = () => fetcher<{status: string, synced_count: number}>('/repositories/sync', { method: 'POST' });
export const getRepositories = () => fetcher<any[]>('/repositories');
export const updateRepositoryPolicy = (id: string, policy: any) => 
  fetcher(`/repositories/${id}/policy`, { method: 'PUT', body: JSON.stringify(policy) });

// Analytics
export const getAnalyticsSummary = () => fetcher<any>('/analytics/summary');
export const getAnalyticsTrends = () => fetcher<any[]>('/analytics/trends');

// Reviews
export const getReviews = (page: number = 1) => fetcher<{data: any[], page: number}>(`/reviews?page=${page}`);
export const getReviewDetail = (id: string) => fetcher<any>(`/reviews/${id}`);
export const getReviewFindings = (id: string) => fetcher<any[]>(`/reviews/${id}/findings`);
