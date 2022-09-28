import { CurrencyArrowSeparator, CurrencyArrowSeparatorProps } from 'cow-react/common/pure/CurrencyArrowSeparator'

const defaultProps: CurrencyArrowSeparatorProps = {
  isLoading: false,
  withRecipient: false,
  onSwitchTokens() {
    //
  },
}

export default <CurrencyArrowSeparator {...defaultProps} />
