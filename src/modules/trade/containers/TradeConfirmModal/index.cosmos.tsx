import { useSetAtom } from 'jotai'
import React, { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock } from 'mocks/tradeStateMock'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { TradeConfirmation, TradeConfirmationProps } from '../../pure/TradeConfirmation'

import { TradeConfirmModal } from './index'

import { TradeAmounts } from '../../types/TradeAmounts'

const chainId = SupportedChainId.MAINNET
const account = '0xbd3afb0bb76683ecb4225f9dbc91f998713c3b01'
const defaultTxHash = '0x1e0e4acc2c5316b43240699c74a0f3e10ef2a3228904c981dddfb451d32ee8f4'

const tradeAmounts: TradeAmounts = {
  inputAmount: inputCurrencyInfoMock.amount!,
  outputAmount: outputCurrencyInfoMock.amount!,
}

const confirmationState: TradeConfirmationProps = {
  title: 'Review order',
  inputCurrencyInfo: inputCurrencyInfoMock,
  outputCurrencyInfo: outputCurrencyInfoMock,
  priceImpact: priceImpactMock,
  isConfirmDisabled: false,
  onConfirm() {
    console.log('onConfirm')
  },
  onDismiss() {
    console.log('onDismiss')
  },
}

function Custom({ stateValue }: { stateValue: string }) {
  const updateWalletInfo = useSetAtom(walletInfoAtom)
  const actions = useTradeConfirmActions()

  useEffect(() => {
    actions.onOpen()

    if (stateValue === 'error') {
      actions.onError('Something wrong')
      return
    }

    if (stateValue === 'pending') {
      actions.onSign(tradeAmounts)
      return
    }

    if (stateValue === 'success') {
      actions.onSuccess(defaultTxHash)
      return
    }
  }, [stateValue, actions])

  useEffect(() => {
    updateWalletInfo({ chainId, account })
  }, [updateWalletInfo])

  return (
    <TradeConfirmModal>
      <TradeConfirmation {...confirmationState} onDismiss={console.log}>
        <span>Some content</span>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}

const Fixtures = {
  default: <Custom stateValue="default" />,
  pending: <Custom stateValue="pending" />,
  error: <Custom stateValue="error" />,
  success: <Custom stateValue="success" />,
}

export default Fixtures
