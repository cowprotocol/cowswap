import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { TradeType } from 'modules/trade'

import { usePermitInfo } from './usePermitInfo'

/**
 * Whether the token supports permit for given trade type
 *
 * @param token
 * @param tradeType
 */
export function useTokenSupportsPermit(token: Nullish<Currency>, tradeType: Nullish<TradeType>): boolean {
  const permitInfo = usePermitInfo(token, tradeType)

  return isSupportedPermitInfo(permitInfo)
}
