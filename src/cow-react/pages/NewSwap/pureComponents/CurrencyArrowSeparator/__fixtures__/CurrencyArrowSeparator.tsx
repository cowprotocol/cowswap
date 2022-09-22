import {
  CurrencyArrowSeparator,
  CurrencyArrowSeparatorProps,
} from 'cow-react/pages/NewSwap/pureComponents/CurrencyArrowSeparator'

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
