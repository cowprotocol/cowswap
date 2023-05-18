import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useIsTxBundlingEnabled } from 'common/hooks/useIsTxBundlingEnabled'
import { Nullish } from 'types'

export function useIsSafeApprovalBundle(amount: Nullish<CurrencyAmount<Currency>>): boolean {
  const needsApproval = useNeedsApproval(amount)
  const isTxBundlingEnabled = useIsTxBundlingEnabled()

  return isTxBundlingEnabled && needsApproval
}
