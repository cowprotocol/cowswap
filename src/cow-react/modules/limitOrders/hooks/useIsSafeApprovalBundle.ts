import { useNeedsApproval } from '@cow/common/hooks/useNeedsApproval'
import { useIsTxBundlingEnabled } from '@cow/common/hooks/useIsTxBundlingEnabled'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'

export function useIsSafeApprovalBundle(amount: Nullish<CurrencyAmount<Currency>>): boolean {
  const needsApproval = useNeedsApproval(amount)
  const isTxBundlingEnabled = useIsTxBundlingEnabled()

  return isTxBundlingEnabled && needsApproval
}
