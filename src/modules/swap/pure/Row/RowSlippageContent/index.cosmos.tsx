import { Percent } from '@uniswap/sdk-core'
import { RowSlippageContent, RowSlippageContentProps } from 'modules/swap/pure/Row/RowSlippageContent'
import { RowSlippageProps } from 'modules/swap/containers/Row/RowSlippage'

const defaultProps: RowSlippageProps & RowSlippageContentProps = {
  isEthFlow: true,
  symbols: ['ETH', 'WETH'],
  allowedSlippage: new Percent(1, 100),
  get displaySlippage() {
    return this.isEthFlow ? '2%' : '0.2%'
  },
  toggleSettings() {
    console.log('RowSlippageContent settings toggled!')
  },
}

export default <RowSlippageContent {...defaultProps} />
