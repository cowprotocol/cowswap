import { Percent } from '@uniswap/sdk-core'
import { RowSlippageContent, RowSlippageAuxProps } from '.'
import { RowSlippageProps } from '@cow/modules/swap/containers/RowSlippage'
import { getTheme } from '@src/theme'

import { DefaultTheme } from 'styled-components/macro'

const defaultProps: RowSlippageProps & RowSlippageAuxProps = {
  theme: getTheme(false) as DefaultTheme,
  allowedSlippage: new Percent(1, 100),
  displaySlippage: '1%',
  toggleSettings() {
    console.log('settings toggled!')
  },
}

export default <RowSlippageContent {...defaultProps} />
