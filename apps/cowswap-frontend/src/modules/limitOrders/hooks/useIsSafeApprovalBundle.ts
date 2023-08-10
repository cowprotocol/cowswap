import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useIsTxBundlingEnabled } from 'common/hooks/featureFlags/useIsTxBundlingEnabled'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

export function useIsSafeApprovalBundle(amount: Nullish<CurrencyAmount<Currency>>): boolean {
  const needsApproval = useNeedsApproval(amount)
  const isTxBundlingEnabled = useIsTxBundlingEnabled()

  return isTxBundlingEnabled && needsApproval
}
