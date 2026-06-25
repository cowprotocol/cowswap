import { atom, useAtomValue } from 'jotai'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ACTIVE_VALIDATION_CASES, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'

import { useTradePriceImpact } from '../../hooks/useTradePriceImpact'

export const noImpactWarningAcceptedAtom = atom(false)

export function useShouldShowNoImpactWarning(): boolean {
  const { account } = useWalletInfo()
  const priceImpactParams = useTradePriceImpact()
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeQuote = useTradeQuote()

  return (
    !!account &&
    !tradeQuote.error &&
    (primaryFormValidation === null || ACTIVE_VALIDATION_CASES.includes(primaryFormValidation)) &&
    (priceImpactParams.loading || !priceImpactParams.priceImpact)
  )
}

export function useIsNoImpactWarningAccepted(): boolean {
  const isAccepted = useAtomValue(noImpactWarningAcceptedAtom)
  const shouldShowWarning = useShouldShowNoImpactWarning()

  return !shouldShowWarning || isAccepted
}
