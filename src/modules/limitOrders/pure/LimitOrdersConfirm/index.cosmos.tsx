import { Field } from 'state/swap/actions'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { TradeFlowContext } from '../../services/types'
import { LimitOrdersConfirm } from './index'
import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import React from 'react'
import { PriceImpact } from 'hooks/usePriceImpact'
import { defaultLimitOrdersSettings } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { initLimitRateState } from 'modules/limitOrders/state/limitRateAtom'
import { SetStateAction } from 'jotai'

const inputCurrency = COW[SupportedChainId.MAINNET]
const outputCurrency = GNO[SupportedChainId.MAINNET]

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
  invertedActiveRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 65 * 10 ** 18),
}

const priceImpact: PriceImpact = {
  priceImpact: new Percent(20000, 10),
  loading: false,
  error: undefined,
}

const Warnings = <LimitOrdersWarnings isConfirmScreen={true} priceImpact={priceImpact} />

const Fixtures = {
  default: (
    <LimitOrdersConfirm
      rateInfoParams={rateInfoParams}
      settingsState={defaultLimitOrdersSettings}
      rateImpact={1}
      priceImpact={priceImpact}
      tradeContext={tradeContext}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      limitRateState={initLimitRateState()}
      Warnings={Warnings}
      warningsAccepted={true}
      executionPrice={null}
      onConfirm={() => void 0}
      partiallyFillableOverride={[true, (_?: SetStateAction<boolean | undefined>) => void 0]}
      featurePartialFillsEnabled
    />
  ),
}

export default Fixtures
