import { useSetAtom } from 'jotai'
import { ReactElement, useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock } from 'mocks/tradeStateMock'

import { TradeAmounts } from 'common/types'

import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { TradeConfirmationProps } from '../../pure/TradeConfirmation'
import { TradeConfirmation } from '../TradeConfirmation'

import { TradeConfirmModal } from './index'

const chainId = SupportedChainId.MAINNET
const account = '0xbd3afb0bb76683ecb4225f9dbc91f998713c3b01'
const defaultTxHash = '0x1e0e4acc2c5316b43240699c74a0f3e10ef2a3228904c981dddfb451d32ee8f4'

const inputAmountMock = inputCurrencyInfoMock.amount
const outputAmountMock = outputCurrencyInfoMock.amount

if (!inputAmountMock || !outputAmountMock) {
  throw new Error('Trade confirmation cosmos mock requires defined currency amounts')
}

const tradeAmounts: TradeAmounts = {
  inputAmount: inputAmountMock,
  outputAmount: outputAmountMock,
}

function TradeConfirmationContentPreview(restContent: ReactElement): ReactElement {
  return (
    <>
      <span>Some content</span>
      {restContent}
    </>
  )
}

const confirmationState: TradeConfirmationProps = {
  title: 'Review order',
  account: undefined,
  ensName: undefined,
  inputCurrencyInfo: inputCurrencyInfoMock,
  outputCurrencyInfo: outputCurrencyInfoMock,
  priceImpact: priceImpactMock,
  isConfirmDisabled: false,
  recipient: null,
  async onConfirm() {
    return undefined
  },
  onDismiss() {
    return undefined
  },
}

function Custom({ stateValue }: { stateValue: string }): ReactElement {
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
    <TradeConfirmModal title="Swap">
      <TradeConfirmation {...confirmationState} onDismiss={() => undefined}>
        {TradeConfirmationContentPreview}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}

const Fixtures = {
  default: () => <Custom stateValue="default" />,
  pending: () => <Custom stateValue="pending" />,
  error: () => <Custom stateValue="error" />,
  success: () => <Custom stateValue="success" />,
}

export default Fixtures
