import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { getQuoteExpiresInLabel, type QuoteExpirationInput } from './quoteId'

const REFRESH_INTERVAL_MS = 1000

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
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (!expiration) return undefined

    const interval = setInterval(() => {
      setNowMs(Date.now())
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [expiration])

  const expiresIn = useMemo(() => getQuoteExpiresInLabel(expiration, nowMs), [expiration, nowMs])

  return (
    <TooltipContainer>
      <TooltipHeadline>
        <Trans>Share this reference when reporting an issue with this quote.</Trans>
      </TooltipHeadline>

      {expiresIn ? (
        <TooltipMetaRow>
          <TooltipMetaLabel>
            <Trans>Refresh in:</Trans>
          </TooltipMetaLabel>
          <TooltipMetaValue>{expiresIn}</TooltipMetaValue>
        </TooltipMetaRow>
      ) : null}
    </TooltipContainer>
  )
}
