import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { OrderKind } from 'state/orders/actions'
import { TradeFlowContext } from '../../services/tradeFlow'
import { LimitOrdersDetails } from './index'

const inputCurrency = COW[SupportedChainId.MAINNET]
const outputCurrency = GNO[SupportedChainId.MAINNET]

const tradeContext: TradeFlowContext = {
  postOrderParams: {
    class: 'limit',
    account: '0x000',
    chainId: 1,
    signer: {} as any,
    kind: OrderKind.SELL,
    inputAmount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    outputAmount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    sellAmountBeforeFee: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
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

const activeRateDisplay = {
  inputCurrency,
  outputCurrency,
  activeRate: new Fraction(50000000, 20000000),
  activeRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 2 * 10 ** 18),
  inversedActiveRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 65 * 10 ** 18),
}

const Fixtures = {
  default: <LimitOrdersDetails activeRateDisplay={activeRateDisplay} tradeContext={tradeContext} />,
}

export default Fixtures
