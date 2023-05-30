import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { DemoContainer } from 'cosmos.decorator'
import { useValue } from 'react-cosmos/fixture'

import { COW, GNO } from 'legacy/constants/tokens'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/swap/actions'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { limitOrdersConfirmState } from './state'

import { TradeFlowContext } from '../../services/types'

import { LimitOrdersConfirmModal, LimitOrdersConfirmModalProps } from './index'

const chainId = SupportedChainId.MAINNET
const account = '0xbd3afb0bb76683ecb4225f9dbc91f998713c3b01'

const inputCurrency = COW[chainId]
const outputCurrency = GNO[chainId]

const inputCurrencyInfo: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
    feeAmountRaw: CurrencyAmount.fromRawAmount(inputCurrency, 10 * 10 ** 18),
  },
  currency: inputCurrency,
  balance: CurrencyAmount.fromRawAmount(inputCurrency, 250 * 10 ** 18),
  amount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(inputCurrency, 12 * 10 ** 18),
}

const outputCurrencyInfo: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
    feeAmountRaw: CurrencyAmount.fromRawAmount(outputCurrency, 10 * 10 ** 18),
  },
  currency: outputCurrency,
  balance: CurrencyAmount.fromRawAmount(outputCurrency, 250 * 10 ** 18),
  amount: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 12 * 10 ** 18),
}

const tradeContext: TradeFlowContext = {
  postOrderParams: {
    class: OrderClass.LIMIT,
    account: '0x000',
    chainId: 1,
    kind: OrderKind.SELL,
    inputAmount: inputCurrencyInfo.amount!,
    outputAmount: outputCurrencyInfo.amount!,
    sellAmountBeforeFee: inputCurrencyInfo.amount!,
    feeAmount: CurrencyAmount.fromRawAmount(outputCurrency, 10 * 10 ** 18),
    sellToken: inputCurrency,
    buyToken: outputCurrency,
    recipient: '0xaaa',
    recipientAddressOrName: null,
    allowsOffchainSigning: true,
    partiallyFillable: true,
    appDataHash: '0xabc',
  },
  rateImpact: 0,
  appData: {} as any,
  uploadAppData: () => void 0,
  provider: {} as any,
  settlementContract: {} as any,
  chainId: 1,
  dispatch: (() => void 0) as any,
  allowsOffchainSigning: true,
  isGnosisSafeWallet: false,
}

const priceImpact: PriceImpact = {
  priceImpact: new Percent(20000, 10),
  loading: false,
  error: undefined,
}

const defaultProps: LimitOrdersConfirmModalProps = {
  isOpen: true,
  tradeContext,
  inputCurrencyInfo,
  outputCurrencyInfo,
  priceImpact,
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
