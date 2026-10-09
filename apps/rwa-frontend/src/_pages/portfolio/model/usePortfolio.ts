'use client'

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { portfolioMarketsQueryAtomFamily } from './portfolioMarketsQueryAtom'

import { getHeldTickersKey } from '../lib/heldTickers'
import { buildHoldings, type Holding } from '../lib/holdings'
import { matchesPortfolioFilter, type PortfolioFilter } from '../lib/portfolioFilter'

import { getTokenKey, type RwaAssetSummary, type RwaAssetWithMarket, type RwaTokenSummary } from '@/entities/asset'
import {
  type AccountQueryParams,
  type Activity,
  activityQueryAtomFamily,
  type OpenOrder,
  openOrdersQueryAtomFamily,
  type TradeLeg,
  useAccountBalanceSnapshots,
} from '@/widgets/account'

const PORTFOLIO_SCOPE = 'portfolio'

export interface BalancesProgress {
  /** Networks whose current load has finished */
  loaded: number
  total: number
  isLoading: boolean
  /** ms, the oldest network snapshot */
  updatedAt: number | null
}

export interface Portfolio {
  /** `null` until the balances are loaded */
  holdings: Holding[] | null
  /** `holdings` matching the filter */
  filteredHoldings: Holding[] | null
  balancesError: Error | null
  /** Chains whose balances are missing or outdated in `holdings` */
  failedChainIds: number[]
  balancesProgress: BalancesProgress
  refreshBalances(): void
  orders: { data: OpenOrder[] | undefined; error: Error | null }
  activity: { data: Activity[] | undefined; error: Error | null }
  /** Newest first, unfiltered */
  recentActivity: Activity[] | undefined
  getAsset(token: RwaTokenSummary): RwaAssetSummary | undefined
  getLogoUrl(asset: RwaAssetSummary, token?: RwaTokenSummary): string | null
  /** ISO 8601, `null` while market data is loading */
  pricesUpdatedAt: string | null
  /** No market data and no error yet: every holding is unpriced until it loads */
  arePricesLoading: boolean
}

export function usePortfolio(owner: string, assets: RwaAssetSummary[], filter: PortfolioFilter): Portfolio {
  const tokens = useMemo(() => assets.flatMap((asset) => asset.tokens), [assets])
  const assetsByTokenKey = useMemo(
    () => new Map(assets.flatMap((asset) => asset.tokens.map((token) => [getTokenKey(token), asset] as const))),
    [assets],
  )
  const params = useMemo((): AccountQueryParams => ({ owner, scope: PORTFOLIO_SCOPE, tokens }), [owner, tokens])

  const balances = useAccountBalanceSnapshots(owner, tokens)
  const { positions, error: balancesError, failedChainIds, refresh: refreshBalances } = balances
  const { loadedChains, totalChains, isFetching, updatedAt } = balances
  const balancesProgress = useMemo(
    (): BalancesProgress => ({ loaded: loadedChains, total: totalChains, isLoading: isFetching, updatedAt }),
    [isFetching, loadedChains, totalChains, updatedAt],
  )
  const heldTickersKey = useMemo(
    () => getHeldTickersKey(positions, (token) => assetsByTokenKey.get(getTokenKey(token))),
    [positions, assetsByTokenKey],
  )
  const { data: markets, error: marketsError } = useAtomValue(portfolioMarketsQueryAtomFamily(heldTickersKey))
  const orders = useAtomValue(openOrdersQueryAtomFamily(params))
  const activity = useAtomValue(activityQueryAtomFamily(params))

  const marketsByTicker = useMemo(
    () => new Map<string, RwaAssetWithMarket>(markets?.items.map((item) => [item.ticker, item])),
    [markets],
  )

  return useMemo((): Portfolio => {
    const getAsset = (token: RwaTokenSummary): RwaAssetSummary | undefined => assetsByTokenKey.get(getTokenKey(token))
    const getPrice = (asset: RwaAssetSummary): number | null => marketsByTicker.get(asset.ticker)?.market?.price ?? null
    const matchesFilter = (token: RwaTokenSummary): boolean => {
      const asset = getAsset(token)

      return !!asset && matchesPortfolioFilter(filter, asset, token)
    }
    const filterLegs = <T extends TradeLeg>(legs: T[] | undefined): T[] | undefined =>
      legs?.filter((leg) => matchesFilter(leg.assetToken))

    return {
      holdings: positions && buildHoldings(assets, positions, getPrice),
      filteredHoldings:
        positions &&
        buildHoldings(
          assets,
          positions.filter(({ token }) => matchesFilter(token)),
          getPrice,
        ),
      balancesError,
      failedChainIds,
      balancesProgress,
      refreshBalances,
      orders: { data: filterLegs(orders.data), error: orders.error },
      activity: { data: filterLegs(activity.data), error: activity.error },
      recentActivity: activity.data,
      getAsset,
      getLogoUrl: (asset) => asset.logoUrl ?? null,
      pricesUpdatedAt: markets?.items.find((item) => item.market?.updatedAt)?.market?.updatedAt ?? null,
      arePricesLoading: heldTickersKey !== '' && !markets && !marketsError,
    }
  }, [
    activity,
    assets,
    assetsByTokenKey,
    balancesError,
    balancesProgress,
    failedChainIds,
    filter,
    heldTickersKey,
    markets,
    marketsError,
    marketsByTicker,
    orders,
    positions,
    refreshBalances,
  ])
}
