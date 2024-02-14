import { useIsBundlingSupported } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useNeedsApproval } from './useNeedsApproval'

export function useIsSafeApprovalBundle(amount: Nullish<CurrencyAmount<Currency>>): boolean {
  const needsApproval = useNeedsApproval(amount)
  const isBundlingSupported = useIsBundlingSupported()

  return isBundlingSupported && needsApproval
}
