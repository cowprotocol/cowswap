import { Field } from 'state/swap/actions'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { OrderClass, OrderKind } from 'state/orders/actions'
import { TradeFlowContext } from '../../services/tradeFlow'
import { LimitOrdersConfirm } from './index'
import { LimitOrdersWarnings } from '@cow/modules/limitOrders/containers/LimitOrdersWarnings'
import React from 'react'
import { PriceImpact } from 'hooks/usePriceImpact'
import { defaultLimitOrdersSettings } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { initLimitRateState } from '@cow/modules/limitOrders/state/limitRateAtom'

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
    class: OrderClass.LIMIT,
    account: '0x000',
    chainId: 1,
    kind: OrderKind.SELL,
    inputAmount: inputCurrencyInfo.rawAmount!,
    outputAmount: outputCurrencyInfo.rawAmount!,
    sellAmountBeforeFee: inputCurrencyInfo.rawAmount!,
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
    />
  ),
}

export default Fixtures
