'use client'

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { portfolioMarketsQueryAtom } from './portfolioMarketsQueryAtom'

import { buildHoldings, type Holding } from '../lib/holdings'
import { matchesPortfolioFilter, type PortfolioFilter } from '../lib/portfolioFilter'

import { getTokenKey, type RwaAsset, type RwaAssetWithMarket, type RwaToken } from '@/entities/asset'
import {
  type AccountQueryParams,
  type Activity,
  activityQueryAtomFamily,
  type OpenOrder,
  openOrdersQueryAtomFamily,
  type TradeLeg,
  useAccountBalances,
} from '@/widgets/account'

const PORTFOLIO_SCOPE = 'portfolio'

export interface Portfolio {
  /** `null` until the balances are loaded */
  holdings: Holding[] | null
  /** `holdings` matching the filter */
  filteredHoldings: Holding[] | null
  balancesError: Error | null
  orders: { data: OpenOrder[] | undefined; error: Error | null }
  activity: { data: Activity[] | undefined; error: Error | null }
  /** Newest first, unfiltered */
  recentActivity: Activity[] | undefined
  getAsset(token: RwaToken): RwaAsset | undefined
  getLogoUrl(asset: RwaAsset, token?: RwaToken): string | null
  /** ISO 8601, `null` while market data is loading */
  pricesUpdatedAt: string | null
}

export function usePortfolio(owner: string, assets: RwaAsset[], filter: PortfolioFilter): Portfolio {
  const tokens = useMemo(() => assets.flatMap((asset) => asset.tokens), [assets])
  const assetsByTokenKey = useMemo(
    () => new Map(assets.flatMap((asset) => asset.tokens.map((token) => [getTokenKey(token), asset] as const))),
    [assets],
  )
  const params = useMemo((): AccountQueryParams => ({ owner, scope: PORTFOLIO_SCOPE, tokens }), [owner, tokens])

  const { positions, error: balancesError } = useAccountBalances(owner, tokens)
  const markets = useAtomValue(portfolioMarketsQueryAtom).data
  const orders = useAtomValue(openOrdersQueryAtomFamily(params))
  const activity = useAtomValue(activityQueryAtomFamily(params))

  const marketsByTicker = useMemo(
    () => new Map<string, RwaAssetWithMarket>(markets?.items.map((item) => [item.ticker, item])),
    [markets],
  )

  return useMemo((): Portfolio => {
    const getAsset = (token: RwaToken): RwaAsset | undefined => assetsByTokenKey.get(getTokenKey(token))
    const getPrice = (asset: RwaAsset): number | null => marketsByTicker.get(asset.ticker)?.market?.price ?? null
    const matchesFilter = (token: RwaToken): boolean => {
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
      orders: { data: filterLegs(orders.data), error: orders.error },
      activity: { data: filterLegs(activity.data), error: activity.error },
      recentActivity: activity.data,
      getAsset,
      getLogoUrl: (asset, token) => {
        const coingeckoId = token?.coingeckoId ?? asset.tokens.find((assetToken) => assetToken.coingeckoId)?.coingeckoId

        return (coingeckoId && marketsByTicker.get(asset.ticker)?.market?.tokens[coingeckoId]?.logoUrl) || null
      },
      pricesUpdatedAt: markets?.items.find((item) => item.market?.updatedAt)?.market?.updatedAt ?? null,
    }
  }, [activity, assets, assetsByTokenKey, balancesError, filter, markets, marketsByTicker, orders, positions])
}
