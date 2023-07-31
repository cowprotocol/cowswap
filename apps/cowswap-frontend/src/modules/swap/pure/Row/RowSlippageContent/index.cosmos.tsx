import { Percent } from '@uniswap/sdk-core'

import { RowSlippageProps } from '../../../containers/Row/RowSlippage'
import { RowSlippageContent, RowSlippageContentProps } from './index'

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
