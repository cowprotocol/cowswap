import { CurrencyArrowSeparator, CurrencyArrowSeparatorProps } from 'cow-react/swap/dumb/CurrencyArrowSeparator'

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
