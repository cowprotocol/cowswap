import { COW } from '@cowprotocol/common-const'
import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { RowFeeContent, RowFeeContentProps } from './index'

const currency = COW[SupportedChainId.MAINNET]
const fee = 10

const defaultProps: RowFeeContentProps = {
  label: 'Est. Fee',
  feeAmount: CurrencyAmount.fromRawAmount(currency, fee * 10 ** 18),
  isFree: false,
  get feeInFiat() {
    return this.feeAmount ? currencyAmountToTokenAmount(this.feeAmount.multiply('100')) : null
  },
  tooltip: 'This is a tooltip that describes stuff. Stuff that is great. Great stuff. The best stuff on earth.',
}

export default <RowFeeContent {...defaultProps} />
