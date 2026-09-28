'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsExplorer.module.css'
import { AssetsSearchInput } from './AssetsSearchInput'
import { AssetsSearchResults } from './AssetsSearchResults'
import { AssetsSortControl } from './AssetsSortControl'

import { assetsPageAtom } from '../model/assetsPageAtom'
import { assetsPageQueryAtom } from '../model/assetsQueryAtoms'
import { assetsSearchQueryAtom } from '../model/assetsSearchQueryAtom'

import { AssetsTable } from '@/entities/asset'
import { Pagination } from '@/shared/ui/pagination'
import { StatusMessage } from '@/shared/ui/status-message'

export function AssetsExplorer(): ReactNode {
  const query = useAtomValue(assetsSearchQueryAtom)
  const setPage = useSetAtom(assetsPageAtom)

  return (
    <section className={styles.explorer}>
      <div className={styles.toolbar}>
        <AssetsSearchInput />
        {!query && <AssetsSortControl onChange={() => setPage(1)} />}
      </div>
      {query.trim() ? <AssetsSearchResults /> : <AssetsList />}
    </section>
  )
}

function AssetsList(): ReactNode {
  const setPage = useSetAtom(assetsPageAtom)
  const { data, error } = useAtomValue(assetsPageQueryAtom)

  if (error && !data) return <StatusMessage>Failed to load assets: {error.message}</StatusMessage>
  if (!data) return <StatusMessage>Loading…</StatusMessage>

  return (
    <>
      {data.degraded && <StatusMessage>Market data is temporarily unavailable</StatusMessage>}
      <AssetsTable assets={data.items} />
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </>
  )
}
