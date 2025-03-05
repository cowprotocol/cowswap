import { ReactNode } from 'react'

import { PriorityTokensUpdater } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { TradeFormValidationUpdater } from 'modules/tradeFormValidation'
import { TradeQuoteUpdater } from 'modules/tradeQuote'
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
  onChangeRecipient: (recipient: string | null) => void
}

export function TradeWidgetUpdaters({
  disableQuotePolling,
  disableNativeSelling,
  enableSmartSlippage,
  onChangeRecipient,
  children,
}: TradeWidgetUpdatersProps) {
  const { chainId, account } = useWalletInfo()
  const priorityTokenAddresses = usePriorityTokenAddresses()

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
