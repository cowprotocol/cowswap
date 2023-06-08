import { Percent } from '@uniswap/sdk-core'

import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'
import { ConfirmDetailsItem } from 'modules/twap/pure/ConfirmDetailsItem'

export type SlippageRowProps = {
  slippage: Percent
}

export function SlippageRow({ slippage }: SlippageRowProps) {
  return (
    <ConfirmDetailsItem>
      <RowSlippage allowedSlippage={slippage} showSettingOnClick={false} />
    </ConfirmDetailsItem>
  )
}
