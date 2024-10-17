import { ReactNode, useEffect } from 'react'

import { PriorityTokensUpdater } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { TradeFormValidationUpdater } from 'modules/tradeFormValidation'
import { TradeQuoteState, TradeQuoteUpdater, useUpdateTradeQuote } from 'modules/tradeQuote'
import { SmartSlippageUpdater } from 'modules/tradeSlippage'

import { usePriorityTokenAddresses } from '../../hooks/usePriorityTokenAddresses'
import { useResetRecipient } from '../../hooks/useResetRecipient'
import { CommonTradeUpdater } from '../../updaters/CommonTradeUpdater'
import { DisableNativeTokenSellingUpdater } from '../../updaters/DisableNativeTokenSellingUpdater'
import { PriceImpactUpdater } from '../../updaters/PriceImpactUpdater'
import { RecipientAddressUpdater } from '../../updaters/RecipientAddressUpdater'

interface TradeWidgetUpdatersProps {
  disableQuotePolling: boolean
  disableNativeSelling: boolean
  enableSmartSlippage?: boolean
  children: ReactNode
  tradeQuoteStateOverride?: TradeQuoteState | null
  onChangeRecipient: (recipient: string | null) => void
}

export function TradeWidgetUpdaters({
  disableQuotePolling,
  disableNativeSelling,
  tradeQuoteStateOverride,
  enableSmartSlippage,
  onChangeRecipient,
  children,
}: TradeWidgetUpdatersProps) {
  const { chainId, account } = useWalletInfo()
  const updateQuoteState = useUpdateTradeQuote()
  const priorityTokenAddresses = usePriorityTokenAddresses()

  useEffect(() => {
    if (disableQuotePolling && tradeQuoteStateOverride) {
      updateQuoteState(tradeQuoteStateOverride)
    }
  }, [tradeQuoteStateOverride, disableQuotePolling, updateQuoteState])

  useResetRecipient(onChangeRecipient)

  return (
    <>
      <PriorityTokensUpdater account={account} chainId={chainId} tokenAddresses={priorityTokenAddresses} />
      <RecipientAddressUpdater />

      {!disableQuotePolling && <TradeQuoteUpdater />}
      <PriceImpactUpdater />
      <TradeFormValidationUpdater />
      <CommonTradeUpdater />
      {enableSmartSlippage && <SmartSlippageUpdater />}
      {disableNativeSelling && <DisableNativeTokenSellingUpdater />}
      {children}
    </>
  )
}
