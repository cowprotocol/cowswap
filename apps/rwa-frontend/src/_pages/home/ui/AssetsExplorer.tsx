'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsExplorer.module.css'
import { AssetsSearchInput } from './AssetsSearchInput'
import { AssetsSearchResults } from './AssetsSearchResults'
import { AssetsSortControl } from './AssetsSortControl'

import { ASSETS_PAGE_SIZE, assetsPageAtom } from '../model/assetsPageAtom'
import { assetsSearchQueryAtom } from '../model/assetsSearchQueryAtom'
import { assetsSortAtom } from '../model/assetsSortAtom'

import { AssetsTable, useAssetsPage } from '@/entities/asset'
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
  const { sort, order } = useAtomValue(assetsSortAtom)
  const [page, setPage] = useAtom(assetsPageAtom)
  const { data, error, isLoading } = useAssetsPage({ page, pageSize: ASSETS_PAGE_SIZE, sort, order })

  if (error && !data) return <StatusMessage>Failed to load assets: {error.message}</StatusMessage>
  if (isLoading || !data) return <StatusMessage>Loading…</StatusMessage>

  return (
    <>
      <AssetsTable assets={data.items} />
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </>
  )
}
