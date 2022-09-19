import {
  CurrencyArrowSeparator,
  CurrencyArrowSeparatorProps,
} from 'pages/NewSwap/pureComponents/CurrencyArrowSeparator'

const defaultProps: CurrencyArrowSeparatorProps = {
  isLoading: false,
  withRecipient: false,
  onSwitchTokens() {
    //
  },
}

export default {
  Default: <CurrencyArrowSeparator {...defaultProps} />,
}
