import { Percent } from '@uniswap/sdk-core'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'

import { PercentDisplay } from 'common/pure/PercentDisplay'

export type SlippageRowProps = {
  slippage: Percent
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
}

export function SlippageRow({ slippage, slippageLabel, slippageTooltip }: SlippageRowProps) {
  return (
    <ConfirmDetailsItem label={slippageLabel} tooltip={slippageTooltip} withTimelineDot={true} labelOpacity>
      <PercentDisplay percent={+slippage.toFixed(2)} />
    </ConfirmDetailsItem>
  )
}
