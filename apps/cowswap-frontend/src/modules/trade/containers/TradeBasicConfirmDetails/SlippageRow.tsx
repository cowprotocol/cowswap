import { Percent } from '@uniswap/sdk-core'

import { RowSlippage } from '../../../swap/containers/Row/RowSlippage'
import { ConfirmDetailsItem } from '../../pure/ConfirmDetailsItem'

export type SlippageRowProps = {
  slippage: Percent
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
}

export function SlippageRow({ slippage, slippageLabel, slippageTooltip }: SlippageRowProps) {
  return (
    <ConfirmDetailsItem>
      <RowSlippage
        allowedSlippage={slippage}
        showSettingOnClick={false}
        slippageLabel={slippageLabel}
        slippageTooltip={slippageTooltip}
      />
    </ConfirmDetailsItem>
  )
}
