import { Percent } from '@uniswap/sdk-core'

import { RowSlippageContent, RowSlippageContentProps } from './index'

const defaultProps: RowSlippageContentProps = {
  chainId: 1,
  isEoaEthFlow: true,
  symbols: ['ETH', 'WETH'],
  allowedSlippage: new Percent(1, 100),
  get displaySlippage() {
    return this.isEoaEthFlow ? '2%' : '0.2%'
  },
  isSlippageModified: false,
  isSmartSlippageApplied: false,
  smartSlippage: '0.2%',
  setAutoSlippage: () => {
    console.log('setAutoSlippage called!')
  },
  isSmartSlippageLoading: false
}

export default <RowSlippageContent {...defaultProps} />
