import { Percent } from '@uniswap/sdk-core'

import { RowSlippageProps } from 'modules/swap/containers/Row/RowSlippage'
import { RowSlippageContent, RowSlippageContentProps } from 'modules/swap/pure/Row/RowSlippageContent'

const defaultProps: RowSlippageProps & RowSlippageContentProps = {
  isEoaEthFlow: true,
  symbols: ['ETH', 'WETH'],
  allowedSlippage: new Percent(1, 100),
  get displaySlippage() {
    return this.isEoaEthFlow ? '2%' : '0.2%'
  },
  toggleSettings() {
    console.log('RowSlippageContent settings toggled!')
  },
}

export default <RowSlippageContent {...defaultProps} />
