import { getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { isNonEvmChain } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { PermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Nullish } from 'types'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'
import { TradeType } from 'common/modules/tradeNavigation'

import { usePreGeneratedPermitInfoForToken } from './usePreGeneratedPermitInfoForToken'

import { IsTokenPermittableResult } from '../types'

const ORDER_TYPE_SUPPORTS_PERMIT: Record<TradeType, boolean> = {
  [TradeType.SWAP]: true,
  [TradeType.LIMIT_ORDER]: true,
  [TradeType.ADVANCED_ORDERS]: false,
  [TradeType.YIELD]: true,
}

const UNSUPPORTED: PermitInfo = { type: 'unsupported', name: 'native' }

/**
 * Returns the permit info for the token from the pre-generated list (CDN), the only source of truth
 *
 * When it is permittable, returned type is `{type: 'dai-like' | 'eip-2612', ...}`
 * When it is not, or the token is not in the list, returned type is `{type: 'unsupported'}`
 * When it is unknown (list is loading or permit is not applicable), returned type is `undefined`
 */
// eslint-disable-next-line complexity
export function usePermitInfo(token: Nullish<Currency>, tradeType: Nullish<TradeType>): IsTokenPermittableResult {
  const { chainId } = useWalletInfo()
  const isPermitSupported = !!tradeType && ORDER_TYPE_SUPPORTS_PERMIT[tradeType] && !isNonEvmChain(chainId)
  const isPermitEnabled = useIsPermitEnabled() && isPermitSupported
  const isNative = !!token && getIsNativeToken(token)

  const { permitInfo, isLoading } = usePreGeneratedPermitInfoForToken(
    isPermitEnabled && token && !isNative ? getWrappedToken(token) : undefined,
  )

  if (isNative) {
    return UNSUPPORTED
  }

  if (!isPermitEnabled || !token || isLoading) {
    return undefined
  }

  return permitInfo ?? { type: 'unsupported', name: token.name }
}
