import { useNeedsApproval } from '@cow/common/hooks/useNeedsApproval'
import { useIsTxBundlingEnabled } from '@cow/common/hooks/useIsTxBundlingEnabled'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'

export function useIsSafeApprovalBundle(token: Nullish<Token>, amount: Nullish<CurrencyAmount<Currency>>): boolean {
  const needsApproval = useNeedsApproval(token, amount)
  const isTxBundlingEnabled = useIsTxBundlingEnabled()

  return isTxBundlingEnabled && needsApproval
}
