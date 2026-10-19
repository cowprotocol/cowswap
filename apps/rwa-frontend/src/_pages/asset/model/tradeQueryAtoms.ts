import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { tradeSideAtom } from './tradeSelectionAtoms'

import { assetNetworkStatsQueryOptions, assetQuotesQueryOptions } from '@/entities/asset'

export interface AssetNetworkParams {
  ticker: string
  chainId: number
}

function areParamsEqual(a: AssetNetworkParams, b: AssetNetworkParams): boolean {
  return a.ticker === b.ticker && a.chainId === b.chainId
}

export const tradeQuotesQueryAtomFamily = atomFamily(
  ({ ticker, chainId }: AssetNetworkParams) =>
    atomWithQuery((get) => assetQuotesQueryOptions(ticker, chainId, get(tradeSideAtom))),
  areParamsEqual,
)

export const networkStatsQueryAtomFamily = atomFamily(
  ({ ticker, chainId }: AssetNetworkParams) => atomWithQuery(() => assetNetworkStatsQueryOptions(ticker, chainId)),
  areParamsEqual,
)
