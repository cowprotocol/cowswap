import { Percent } from '@uniswap/sdk-core'

import { RowSlippageContent, RowSlippageContentProps } from 'modules/swap/pure/Row/RowSlippageContent'

const defaultProps: RowSlippageContentProps = {
  chainId: 1,
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
