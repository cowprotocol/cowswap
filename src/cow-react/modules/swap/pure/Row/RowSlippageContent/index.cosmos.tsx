import { Percent } from '@uniswap/sdk-core'
import { RowSlippageContent, RowSlippageContentProps } from '@cow/modules/swap/pure/Row/RowSlippageContent'
import { RowSlippageProps } from '@cow/modules/swap/containers/RowSlippage'

const defaultProps: RowSlippageProps & RowSlippageContentProps = {
  allowedSlippage: new Percent(1, 100),
  displaySlippage: '1%',
  toggleSettings() {
    console.log('settings toggled!')
  },
}

export default <RowSlippageContent {...defaultProps} />
