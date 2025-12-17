import { ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { CircleProgress, HoverTooltip, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { useTradeQuoteCounter, QUOTE_POLLING_INTERVAL, useTradeQuote } from 'modules/tradeQuote'

const size = 18

export function QuotePolingProgress(): ReactNode {
  const { isLoading } = useTradeQuote()
  const counter = useTradeQuoteCounter()
  const percent = Math.ceil((counter * 100) / QUOTE_POLLING_INTERVAL)
  const time = displayTime(counter, true)

  const content = <span>{counter === 0 ? t`Quote is updating...` : t`Quote will be updated in ${time}`}</span>

  return (
    <HoverTooltip wrapInContainer placement="top" content={content}>
      <CircleProgress
        isLoading={isLoading}
        size={size}
        percent={percent}
        backgroundColor={`var(${UI.COLOR_PAPER_DARKER})`}
        borderColor={`var(${UI.COLOR_TEXT_OPACITY_60})`}
        borderWidth={2}
      />
    </HoverTooltip>
  )
}
