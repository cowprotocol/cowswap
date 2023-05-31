import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock } from 'mocks/tradeStateMock'
import { useValue } from 'react-cosmos/fixture'
import styled from 'styled-components/macro'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { TradeConfirmationProps } from '../../pure/TradeConfirmation'
import { updateTradeConfirmStateAtom } from '../../state/tradeConfirmStateAtom'

import { TradeConfirmModal } from './index'

const chainId = SupportedChainId.MAINNET
const account = '0xbd3afb0bb76683ecb4225f9dbc91f998713c3b01'
const defaultTxHash = '0x1e0e4acc2c5316b43240699c74a0f3e10ef2a3228904c981dddfb451d32ee8f4'

const confirmationState: TradeConfirmationProps = {
  children: <span>Some content</span>,
  inputCurrencyInfo: inputCurrencyInfoMock,
  outputCurrencyInfo: outputCurrencyInfoMock,
  priceImpact: priceImpactMock,
  isConfirmDisabled: false,
  onConfirm() {
    console.log('onConfirm')
  },
}

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
  background: white;
  padding: 10px;
  border-radius: 15px;
`

function Custom() {
  const updateWalletInfo = useUpdateAtom(walletInfoAtom)
  const updateState = useUpdateAtom(updateTradeConfirmStateAtom)

  const [isPending] = useValue('isPending', { defaultValue: false })
  const [isTransactionSent] = useValue('isTransactionSent', { defaultValue: false })
  const [hasError] = useValue('hasError', { defaultValue: false })

  useEffect(() => {
    if (hasError) {
      updateState({
        error: 'Something wrong',
      })
      return
    }

    if (isPending) {
      updateState({
        isPending: true,
        transactionHash: null,
        error: null,
      })
      return
    }

    if (isTransactionSent) {
      updateState({
        isPending: false,
        transactionHash: defaultTxHash,
        error: null,
      })
      return
    }

    updateState({ transactionHash: null, isPending: false, error: null })
  }, [hasError, isPending, isTransactionSent, updateState])

  useEffect(() => {
    updateWalletInfo({ chainId, account })

    updateState({ confirmationState })
  }, [updateWalletInfo, updateState])

  return <TradeConfirmModal />
}

const Fixtures = {
  default: (
    <Wrapper>
      <Custom />
    </Wrapper>
  ),
}

export default Fixtures
