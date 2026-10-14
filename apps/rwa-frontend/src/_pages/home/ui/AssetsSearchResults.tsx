'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import { assetsSearchQueryResultAtom } from '../model/assetsQueryAtoms'
import { debouncedAssetsSearchQueryAtom } from '../model/assetsSearchQueryAtom'

import { AssetsTable } from '@/entities/asset'
import { StatusMessage } from '@/shared/ui/status-message'

export function AssetsSearchResults(): ReactNode {
  const query = useAtomValue(debouncedAssetsSearchQueryAtom)
  const { data, error } = useAtomValue(assetsSearchQueryResultAtom)

  if (error && !data) return <StatusMessage>Search failed: {error.message}</StatusMessage>
  if (!query || !data) return <StatusMessage>Searching…</StatusMessage>
  if (!data.items.length) return <StatusMessage>Nothing found for “{query}”</StatusMessage>

  return <AssetsTable assets={data.items} />
}
