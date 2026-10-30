'use client'

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { portfolioMarketsQueryAtomFamily } from './portfolioMarketsQueryAtom'

import { getHeldTickersKey } from '../lib/heldTickers'
import { buildHoldings, type Holding, type HoldingPrices } from '../lib/holdings'
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
  const { data: marketsData, error: marketsError } = useAtomValue(portfolioMarketsQueryAtomFamily(heldTickersKey))
  const markets = marketsData?.items
  const orders = useAtomValue(openOrdersQueryAtomFamily(params))
  const activity = useAtomValue(activityQueryAtomFamily(params))

  const prices = useMemo(() => getHoldingPrices(markets), [markets])

  return useMemo((): Portfolio => {
    const getAsset = (token: RwaTokenSummary): RwaAssetSummary | undefined => assetsByTokenKey.get(getTokenKey(token))
    const matchesFilter = (token: RwaTokenSummary): boolean =>
      !!getAsset(token) && matchesPortfolioFilter(filter, token)
    const filterLegs = <T extends TradeLeg>(legs: T[] | undefined): T[] | undefined =>
      legs?.filter((leg) => matchesFilter(leg.assetToken))

    return {
      holdings: positions && buildHoldings(assets, positions, prices),
      filteredHoldings:
        positions &&
        buildHoldings(
          assets,
          positions.filter(({ token }) => matchesFilter(token)),
          prices,
        ),
      balancesError,
      failedChainIds,
      balancesProgress,
      refreshBalances,
      orders: { data: filterLegs(orders.data), error: orders.error },
      activity: { data: filterLegs(activity.data), error: activity.error },
      getLogoUrl: (asset) => asset.logoUrl ?? null,
      pricesUpdatedAt: markets?.find((item) => item.market?.updatedAt)?.market?.updatedAt ?? null,
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
    orders,
    positions,
    prices,
    refreshBalances,
  ])
}

function getHoldingPrices(markets: RwaAssetWithMarket[] | undefined): HoldingPrices {
  const marketsByTicker = new Map(markets?.map((item) => [item.ticker, item.market]))
  const tokenPricesByKey = getTokenPricesByKey(markets)
  const sharesPerTokenByKey = new Map(markets?.flatMap(({ market }) => Object.entries(market?.sharesPerToken ?? {})))

  return {
    getAssetPrice: (asset) => marketsByTicker.get(asset.ticker)?.price ?? null,
    getTokenPrice: (token) => tokenPricesByKey.get(getTokenKey(token)) ?? null,
    getSharesPerToken: (token) => sharesPerTokenByKey.get(getTokenKey(token)) ?? null,
  }
}

/** USD per token, keyed by `getTokenKey` */
function getTokenPricesByKey(markets: RwaAssetWithMarket[] | undefined): Map<string, number | null> {
  return new Map(
    markets?.flatMap(({ tokens, market }) =>
      tokens.flatMap(({ coingeckoId, ...token }) =>
        coingeckoId ? [[getTokenKey(token), market?.tokens[coingeckoId]?.price ?? null] as const] : [],
      ),
    ),
  )
}
