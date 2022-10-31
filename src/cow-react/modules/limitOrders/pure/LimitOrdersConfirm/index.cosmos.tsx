import { Field } from 'state/swap/actions'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { OrderKind } from 'state/orders/actions'
import { TradeFlowContext } from '../../services/tradeFlow'
import { LimitOrdersConfirm } from './index'

const inputCurrency = COW[SupportedChainId.MAINNET]
const outputCurrency = GNO[SupportedChainId.MAINNET]

const inputCurrencyInfo: CurrencyInfo = {
  field: Field.INPUT,
  viewAmount: '20',
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
  },
  currency: inputCurrency,
  balance: CurrencyAmount.fromRawAmount(inputCurrency, 250 * 10 ** 18),
  rawAmount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(inputCurrency, 12 * 10 ** 18),
}

const outputCurrencyInfo: CurrencyInfo = {
  field: Field.INPUT,
  viewAmount: '20',
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
  },
  currency: outputCurrency,
  balance: CurrencyAmount.fromRawAmount(outputCurrency, 250 * 10 ** 18),
  rawAmount: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 12 * 10 ** 18),
}

const tradeContext: TradeFlowContext = {
  postOrderParams: {
    account: '0x000',
    chainId: 1,
    signer: {} as any,
    kind: OrderKind.SELL,
    inputAmount: inputCurrencyInfo.rawAmount!,
    outputAmount: outputCurrencyInfo.rawAmount!,
    sellAmountBeforeFee: inputCurrencyInfo.rawAmount!,
    feeAmount: CurrencyAmount.fromRawAmount(outputCurrency, 10 * 10 ** 18),
    sellToken: inputCurrency,
    buyToken: outputCurrency,
    validTo: Date.now() + 10000000,
    recipient: '0xaaa',
    recipientAddressOrName: null,
    allowsOffchainSigning: true,
    appDataHash: '0xabc',
  },
  settlementContract: {} as any,
  chainId: 1,
  dispatch: (() => void 0) as any,
  allowsOffchainSigning: true,
  isGnosisSafeWallet: false,
}

const Fixtures = {
  default: (
    <LimitOrdersConfirm
      activeRate={'2'}
      activeRateFiatAmount={CurrencyAmount.fromRawAmount(outputCurrency, 2 * 10 ** 18)}
      tradeContext={tradeContext}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      onConfirm={() => void 0}
    />
  ),
}

export default Fixtures
