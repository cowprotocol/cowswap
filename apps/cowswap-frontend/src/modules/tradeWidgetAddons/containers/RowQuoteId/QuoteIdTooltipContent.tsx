import { type ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useTradeQuoteCounter } from 'modules/tradeQuote'

import { type QuoteExpirationInput } from './quoteId'

const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TooltipHeadline = styled.div`
  line-height: 1.35;
`

const TooltipMetaRow = styled.div`
  display: flex;
  gap: 8px;
  line-height: 1.25;
  font-size: 12px;
`

const TooltipMetaLabel = styled.span`
  opacity: 0.75;
`

const TooltipMetaValue = styled.span`
  font-weight: 500;
`

interface QuoteIdTooltipContentProps {
  expiration?: QuoteExpirationInput
}

export function QuoteIdTooltipContent({ expiration }: QuoteIdTooltipContentProps): ReactNode {
  const quoteRefreshCounter = useTradeQuoteCounter()
  const refreshIn = displayTime(quoteRefreshCounter)

  return (
    <TooltipContainer>
      <TooltipHeadline>
        <Trans>Share this reference when reporting an issue with this quote.</Trans>
      </TooltipHeadline>

      {expiration ? (
        <TooltipMetaRow>
          <TooltipMetaLabel>
            <Trans>Refresh in:</Trans>
          </TooltipMetaLabel>
          <TooltipMetaValue>{refreshIn}</TooltipMetaValue>
        </TooltipMetaRow>
      ) : null}
    </TooltipContainer>
  )
}
