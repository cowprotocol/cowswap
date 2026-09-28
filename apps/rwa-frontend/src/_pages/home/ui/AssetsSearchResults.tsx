'use client'

import type { ReactNode } from 'react'

import { useAssetsSearch } from '../api/useAssetsSearch'

import { AssetsTable } from '@/entities/asset'
import { StatusMessage } from '@/shared/ui/status-message'

export function AssetsSearchResults(): ReactNode {
  const { query, items, error, isLoading } = useAssetsSearch()

  if (error) return <StatusMessage>Search failed: {error.message}</StatusMessage>
  if (isLoading || !items) return <StatusMessage>Searching…</StatusMessage>
  if (!items.length) return <StatusMessage>Nothing found for “{query}”</StatusMessage>

  return <AssetsTable assets={items} />
}
