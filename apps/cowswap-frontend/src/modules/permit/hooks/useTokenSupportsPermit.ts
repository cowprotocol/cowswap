import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { TradeType } from 'modules/trade'

import { useIsTokenPermittable } from './useIsTokenPermittable'

export function useTokenSupportsPermit(token: Nullish<Currency>, tradeType: Nullish<TradeType>): boolean {
  const permitInfo = useIsTokenPermittable(token, tradeType)

  return !!permitInfo && permitInfo.type !== 'unsupported'
}
