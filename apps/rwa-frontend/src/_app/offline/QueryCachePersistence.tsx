'use client'

import { useEffect } from 'react'

import type { QueryClient } from '@tanstack/query-core'

import { persistQueryCache, type QueryPersistenceRules } from './persistQueryCache'

import { isDegradedResponse, RWA_QUERY_KEY_ROOT } from '@/shared/api'

export const RWA_QUERY_PERSISTENCE_RULES: QueryPersistenceRules = {
  isPersistedQuery: (queryKey) => queryKey[0] === RWA_QUERY_KEY_ROOT,
  isPersistableData: (data) => data !== undefined && !isDegradedResponse(data),
}

export function QueryCachePersistence({ queryClient }: { queryClient: QueryClient }): null {
  useEffect(() => persistQueryCache(queryClient, RWA_QUERY_PERSISTENCE_RULES), [queryClient])

  return null
}
