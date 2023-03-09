import { CurrencyAmount } from '@uniswap/sdk-core'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { OrderClass, OrderKind } from 'state/orders/actions'
import { TradeFlowContext } from '../../services/tradeFlow'
import { LimitOrdersDetails } from './index'
import { defaultLimitOrdersSettings } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { initLimitRateState } from '@cow/modules/limitOrders/state/limitRateAtom'

const inputCurrency = COW[SupportedChainId.MAINNET]
const outputCurrency = GNO[SupportedChainId.MAINNET]

const tradeContext: TradeFlowContext = {
  postOrderParams: {
    class: OrderClass.LIMIT,
    account: '0x000',
    chainId: 1,
    kind: OrderKind.SELL,
    inputAmount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    outputAmount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    sellAmountBeforeFee: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    feeAmount: CurrencyAmount.fromRawAmount(outputCurrency, 10 * 10 ** 18),
    sellToken: inputCurrency,
    buyToken: outputCurrency,
    recipient: '0xaaa',
    recipientAddressOrName: null,
    allowsOffchainSigning: true,
    appDataHash: '0xabc',
  },
  rateImpact: 0,
  appData: {} as any,
  addAppDataToUploadQueue: () => void 0,
  provider: {} as any,
  settlementContract: {} as any,
  chainId: 1,
  dispatch: (() => void 0) as any,
  allowsOffchainSigning: true,
  isGnosisSafeWallet: false,
}

const rateInfoParams = {
  chainId: 5,
  inputCurrencyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 123 * 10 ** 18),
  outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 456 * 10 ** 18),
  activeRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 2 * 10 ** 18),
  inversedActiveRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 65 * 10 ** 18),
}

const Fixtures = {
  default: (
    <LimitOrdersDetails
      settingsState={defaultLimitOrdersSettings}
      rateInfoParams={rateInfoParams}
      tradeContext={tradeContext}
      executionPrice={null}
      limitRateState={initLimitRateState()}
    />
  ),
}

export default Fixtures
