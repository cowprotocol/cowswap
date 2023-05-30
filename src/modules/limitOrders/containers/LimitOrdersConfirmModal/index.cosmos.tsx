import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DemoContainer } from 'cosmos.decorator'
import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock, tradeContextMock } from 'mocks/tradeStateMock'
import { useValue } from 'react-cosmos/fixture'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { limitOrdersConfirmState } from './state'

import { LimitOrdersConfirmModal, LimitOrdersConfirmModalProps } from './index'

const chainId = SupportedChainId.MAINNET
const account = '0xbd3afb0bb76683ecb4225f9dbc91f998713c3b01'

const defaultProps: LimitOrdersConfirmModalProps = {
  isOpen: true,
  tradeContext: tradeContextMock,
  inputCurrencyInfo: inputCurrencyInfoMock,
  outputCurrencyInfo: outputCurrencyInfoMock,
  priceImpact: priceImpactMock,
  onDismiss() {
    console.log('onDismiss')
  },
}

const defaultTxHash = '0x1e0e4acc2c5316b43240699c74a0f3e10ef2a3228904c981dddfb451d32ee8f4'

function Fixture() {
  const updateWalletInfo = useUpdateAtom(walletInfoAtom)
  const updateState = useUpdateAtom(limitOrdersConfirmState)
  const [isPending] = useValue('isPending', { defaultValue: false })
  const [isTransactionSent] = useValue('isTransactionSent', { defaultValue: false })

  useEffect(() => {
    updateState({ isPending, orderHash: isTransactionSent ? defaultTxHash : null })
  }, [isPending, isTransactionSent, updateState])

  useEffect(() => {
    updateWalletInfo({ chainId, account })
  }, [updateWalletInfo])

  return (
    <DemoContainer>
      <LimitOrdersConfirmModal {...defaultProps} />
    </DemoContainer>
  )
}

export default <Fixture />
