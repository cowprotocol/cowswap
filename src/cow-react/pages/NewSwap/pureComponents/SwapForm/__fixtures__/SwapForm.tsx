import { SwapForm } from 'cow-react/pages/NewSwap/pureComponents/SwapForm'
import { SwapFormProps } from 'cow-react/pages/NewSwap/typings'
import { defaultCurrencyInputPanelProps } from 'cow-react/pages/NewSwap/pureComponents/CurrencyInputPanel/defaultCurrencyInputProps'
import { GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { Percent } from '@uniswap/sdk-core'

const defaultProps: SwapFormProps = {
  recipient: '0x000',
  allowedSlippage: new Percent(12, 10_000),
  isTradePriceUpdating: false,
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
