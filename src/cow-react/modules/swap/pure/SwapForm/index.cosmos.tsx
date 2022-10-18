import { SwapForm } from '@cow/modules/swap/pure/SwapForm/index'
import { SwapFormProps } from '@cow/modules/swap/containers/NewSwapWidget/typings'
import { defaultCurrencyInputPanelProps } from '@cow/common/pure/CurrencyInputPanel/defaultCurrencyInputProps'
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
  swapActions: {
    onCurrencySelection() {
      /**/
    },
    onSwitchTokens() {
      /**/
    },
    onUserInput() {
      /**/
    },
    onChangeRecipient() {
      /**/
    },
  },
}

export default <SwapForm {...defaultProps} />
