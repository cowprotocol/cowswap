import { ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { CircleProgress, HoverTooltip, UI } from '@cowprotocol/ui'

import { useTradeQuoteCounter, QUOTE_POLLING_INTERVAL } from 'modules/tradeQuote'

const size = 18

export function QuotePolingProgress(): ReactNode {
  const counter = useTradeQuoteCounter()
  const percent = Math.ceil((counter * 100) / QUOTE_POLLING_INTERVAL)

  const content = (
    <span>{counter === 0 ? 'Quote is updating...' : <>Quote will be updated in {displayTime(counter, true)}</>}</span>
  )

  return (
    <HoverTooltip wrapInContainer placement="top" content={content}>
      <CircleProgress
        size={size}
        percent={percent}
        backgroundColor={`var(${UI.COLOR_PAPER_DARKER})`}
        borderColor={`var(${UI.COLOR_TEXT_OPACITY_60})`}
        borderWidth={2}
      />
    </HoverTooltip>
  )
}
