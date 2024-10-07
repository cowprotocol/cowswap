import React from 'react'

import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

const CONFIRM_TITLE = 'Confirm order'

export interface YieldConfirmModalProps {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

export function YieldConfirmModal(props: YieldConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient } = props

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const tradeConfirmActions = useTradeConfirmActions()

  const doTrade = () => {
    console.log('TODO doTrade')
  }

  // TODO
  const isConfirmDisabled = false

  return (
    <TradeConfirmModal title={CONFIRM_TITLE}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
        buttonText="Confirm and swap" // TODO
        recipient={recipient}
        appData={appData || undefined}
        isPriceStatic={true}
      ></TradeConfirmation>
    </TradeConfirmModal>
  )
}
