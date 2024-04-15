import { SetStateAction } from 'jotai'

import { COW, GNO } from '@cowprotocol/common-const'
import { OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getAppData } from 'modules/appData'
import { defaultLimitOrdersSettings } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { initLimitRateState } from 'modules/limitOrders/state/limitRateAtom'
import { DEFAULT_TRADE_QUOTE_STATE } from 'modules/tradeQuote'

import { TradeFlowContext } from '../../services/types'

import { LimitOrdersDetails } from './index'

const inputCurrency = COW[SupportedChainId.MAINNET]
const outputCurrency = GNO[SupportedChainId.MAINNET]

const tradeContext: TradeFlowContext = {
  permitInfo: undefined,
  generatePermitHook: () => Promise.resolve(undefined),
  getCachedPermit: () => Promise.resolve(undefined),
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
    partiallyFillable: true,
    appData: getAppData(),
    isSafeWallet: false,
  },
  rateImpact: 0,
  provider: {} as any,
  settlementContract: {} as any,
  chainId: 1,
  dispatch: (() => void 0) as any,
  allowsOffchainSigning: true,
  quoteState: DEFAULT_TRADE_QUOTE_STATE,
}

const rateInfoParams = {
  chainId: 5,
  inputCurrencyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 123 * 10 ** 18),
  outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 456 * 10 ** 18),
  activeRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 2 * 10 ** 18),
  invertedActiveRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 65 * 10 ** 18),
}

const Fixtures = {
  default: (
    <LimitOrdersDetails
      settingsState={defaultLimitOrdersSettings}
      rateInfoParams={rateInfoParams}
      tradeContext={tradeContext}
      executionPrice={null}
      limitRateState={initLimitRateState()}
      partiallyFillableOverride={[true, (_?: SetStateAction<boolean | undefined>) => void 0]}
    />
  ),
}

export default Fixtures
