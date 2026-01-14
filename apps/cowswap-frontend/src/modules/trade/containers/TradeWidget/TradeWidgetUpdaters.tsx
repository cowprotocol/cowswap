import { JSX, ReactNode } from 'react'

import { TradeFormValidationUpdater } from 'modules/tradeFormValidation'
import { TradeQuoteUpdater } from 'modules/tradeQuote'

import { useIsQuoteUpdatePossible } from '../../hooks/useIsQuoteUpdatePossible'
import { useResetRecipient } from '../../hooks/useResetRecipient'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { CommonTradeUpdater } from '../../updaters/CommonTradeUpdater'
import { DisableNativeTokenSellingUpdater } from '../../updaters/DisableNativeTokenSellingUpdater'
import { ForbidSwapSameTokenUpdater } from '../../updaters/ForbidSwapSameTokenUpdater'
import { PriceImpactUpdater } from '../../updaters/PriceImpactUpdater'
import { RecipientAddressUpdater } from '../../updaters/RecipientAddressUpdater'

interface TradeWidgetUpdatersProps {
  disableQuotePolling: boolean
  disableNativeSelling: boolean
  enableSmartSlippage?: boolean
  disableSuggestedSlippageApi?: boolean
  allowSwapSameToken: boolean
  children: ReactNode
  onChangeRecipient: (recipient: string | null) => void
}

export function TradeWidgetUpdaters({
  disableQuotePolling,
  disableNativeSelling,
  disableSuggestedSlippageApi,
  onChangeRecipient,
  allowSwapSameToken,
  children,
}: TradeWidgetUpdatersProps): JSX.Element {
  const { isOpen: isConfirmOpen } = useTradeConfirmState()

  const isQuoteUpdatePossible = useIsQuoteUpdatePossible()

  useResetRecipient(onChangeRecipient)

  return (
    <>
      <RecipientAddressUpdater />

      <TradeQuoteUpdater
        useSuggestedSlippageApi={!disableSuggestedSlippageApi}
        isConfirmOpen={isConfirmOpen}
        isQuoteUpdatePossible={isQuoteUpdatePossible && !disableQuotePolling}
      />
      <PriceImpactUpdater />
      <TradeFormValidationUpdater />
      <CommonTradeUpdater />
      {!allowSwapSameToken && <ForbidSwapSameTokenUpdater />}
      {disableNativeSelling && <DisableNativeTokenSellingUpdater />}
      {children}
    </>
  )
}
