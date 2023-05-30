import { SetStateAction } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { COW, GNO } from 'legacy/constants/tokens'

import { defaultLimitOrdersSettings } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { initLimitRateState } from 'modules/limitOrders/state/limitRateAtom'

import { TradeFlowContext } from '../../services/types'

import { LimitOrdersDetails } from './index'

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
      featurePartialFillsEnabled
    />
  ),
}

export default Fixtures
