import { CurrencyArrowSeparator, CurrencyArrowSeparatorProps } from './index'

const defaultProps: CurrencyArrowSeparatorProps = {
  isLoading: false,
  withRecipient: false,
  onSwitchTokens() {
    //
  },
}

export default <CurrencyArrowSeparator {...defaultProps} />
