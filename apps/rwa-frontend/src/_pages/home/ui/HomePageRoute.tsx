import type { ReactNode } from 'react'

import { HomePage } from './HomePage'

import { buildHomeStructuredData } from '../lib/homeStructuredData'
import { DEFAULT_ASSETS_PAGE_QUERY } from '../model/assetsPageQuery'

import { assetsPageQueryOptions, marketOverviewQueryOptions } from '@/entities/asset'
import { getMarketOverview, listAssets } from '@/entities/asset/index.server'
import { loadPrefetchData, type PrefetchedQuery, PrefetchedQueries } from '@/shared/lib/query-hydration'
import { JsonLd } from '@/shared/lib/seo/index.server'

/** Renders the market overview and the first table page into the HTML, so crawlers get prices and asset links */
export async function HomePageRoute(): Promise<ReactNode> {
  const [assetsPage, overview] = await Promise.all([
    loadPrefetchData('the assets table', () => listAssets(DEFAULT_ASSETS_PAGE_QUERY)),
    loadPrefetchData('the market overview', getMarketOverview),
  ])
  const queries: PrefetchedQuery[] = []

  if (assetsPage)
    queries.push({ queryKey: assetsPageQueryOptions(DEFAULT_ASSETS_PAGE_QUERY).queryKey, data: assetsPage })
  if (overview) queries.push({ queryKey: marketOverviewQueryOptions().queryKey, data: overview })

  return (
    <>
      <JsonLd data={buildHomeStructuredData(assetsPage?.items ?? [])} />
      <PrefetchedQueries queries={queries}>
        <HomePage />
      </PrefetchedQueries>
    </>
  )
}
