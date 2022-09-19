import { SwapForm } from 'pages/NewSwap/components/SwapForm'
import { SwapFormProps } from 'pages/NewSwap/typings'
import { defaultCurrencyInputPanelProps } from 'pages/NewSwap/pureComponents/CurrencyInputPanel/defaultCurrencyInputProps'
import { GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { Percent } from '@uniswap/sdk-core'

const defaultProps: SwapFormProps = {
  recipient: '0x000',
  allowedSlippage: new Percent(12, 10_000),
  isGettingNewQuote: false,
  allowsOffchainSigning: true,
  showRecipientControls: true,
  inputCurrencyInfo: {
    ...defaultCurrencyInputPanelProps.currencyInfo,
  },
  outputCurrencyInfo: {
    ...defaultCurrencyInputPanelProps.currencyInfo,
    currency: GNO[SupportedChainId.MAINNET],
  },
  subsidyAndBalance: defaultCurrencyInputPanelProps.subsidyAndBalance,
  priceImpactParams: defaultCurrencyInputPanelProps.priceImpactParams,
  swapActions: defaultCurrencyInputPanelProps.swapActions,
}

export default {
  Default: <SwapForm {...defaultProps} />,
}
