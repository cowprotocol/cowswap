import { CurrencyArrowSeparator, CurrencyArrowSeparatorProps } from 'cow-react/common/dumb/CurrencyArrowSeparator'

const defaultProps: CurrencyArrowSeparatorProps = {
  isLoading: false,
  withRecipient: false,
  onSwitchTokens() {
    //
  },
}

export default <CurrencyArrowSeparator {...defaultProps} />
