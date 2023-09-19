import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useIsBundlingSupported } from 'modules/wallet'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

export function useIsSafeApprovalBundle(amount: Nullish<CurrencyAmount<Currency>>): boolean {
  const needsApproval = useNeedsApproval(amount)
  const isBundlingSupported = useIsBundlingSupported()

  return isBundlingSupported && needsApproval
}
