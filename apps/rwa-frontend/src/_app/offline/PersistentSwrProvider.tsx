'use client'

import { type ReactNode, useEffect, useState } from 'react'

import { type Cache, SWRConfig } from 'swr'

import { createPersistentSwrCache } from './persistentSwrCache'

import { RWA_API_PREFIX, rwaFetcher } from '@/shared/api'

const shouldPersist = (key: string): boolean => key.startsWith(RWA_API_PREFIX)

export function PersistentSwrProvider({ children }: { children: ReactNode }): ReactNode {
  const [cache, setCache] = useState<Cache | null>(null)

  useEffect(() => {
    let cancelled = false

    void createPersistentSwrCache(shouldPersist).then((created) => {
      if (!cancelled) setCache(created)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Children wait for the hydrated cache, otherwise the first offline render would miss persisted data
  if (!cache) return null

  return (
    <SWRConfig value={{ provider: () => cache, fetcher: rwaFetcher, keepPreviousData: true }}>{children}</SWRConfig>
  )
}
