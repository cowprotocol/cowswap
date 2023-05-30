import { useUpdateAtom } from 'jotai/utils'
import React, { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock } from 'mocks/tradeStateMock'
import styled from 'styled-components/macro'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { TradeConfirmation, TradeConfirmationProps } from '../../pure/TradeConfirmation'
import { updateTradeConfirmStateAtom } from '../../state/tradeConfirmStateAtom'

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

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
  background: ${({ theme }) => theme.bg1};
  border-radius: 15px;
`

function Custom({ stateValue }: { stateValue: string }) {
  const updateWalletInfo = useUpdateAtom(walletInfoAtom)
  const updateState = useUpdateAtom(updateTradeConfirmStateAtom)

  useEffect(() => {
    if (stateValue === 'error') {
      updateState({
        error: 'Something wrong',
      })
      return
    }

    if (stateValue === 'pending') {
      updateState({
        pendingTrade: tradeAmounts,
        transactionHash: null,
        error: null,
      })
      return
    }

    if (stateValue === 'success') {
      updateState({
        transactionHash: defaultTxHash,
        pendingTrade: null,
        error: null,
      })
      return
    }

    updateState({ transactionHash: null, pendingTrade: null, error: null })
  }, [stateValue, updateState])

  useEffect(() => {
    updateWalletInfo({ chainId, account })
  }, [updateWalletInfo, updateState])

  return (
    <TradeConfirmModal>
      <TradeConfirmation {...confirmationState} onDismiss={console.log}>
        <span>Some content</span>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}

const Fixtures = {
  default: (
    <Wrapper>
      <Custom stateValue="default" />
    </Wrapper>
  ),
  pending: (
    <Wrapper>
      <Custom stateValue="pending" />
    </Wrapper>
  ),
  error: (
    <Wrapper>
      <Custom stateValue="error" />
    </Wrapper>
  ),
  success: (
    <Wrapper>
      <Custom stateValue="success" />
    </Wrapper>
  ),
}

export default Fixtures
