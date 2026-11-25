import type { ReactNode } from 'react'

import { dehydrate, HydrationBoundary, QueryClient, type QueryKey } from '@tanstack/react-query'

export interface PrefetchedQuery {
  queryKey: QueryKey
  data: unknown
}

interface PrefetchedQueriesProps {
  queries: PrefetchedQuery[]
  children: ReactNode
}

/**
 * Seeds the client query cache with data loaded by a server page, so it renders into the HTML. The data is stamped with
 * the render time, so a page served from the ISR cache is refetched once past `staleTime`, and the IndexedDB copy isn't
 * restored over it (`persistQueryCache`)
 */
export function PrefetchedQueries({ queries, children }: PrefetchedQueriesProps): ReactNode {
  const queryClient = new QueryClient()

  queries.forEach(({ queryKey, data }) => queryClient.setQueryData(queryKey, data))

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
