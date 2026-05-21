import { type ReactNode } from 'react'

import { HoverTooltip, RowFixed } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'

import { QuoteIdTooltipContent } from './QuoteIdTooltipContent'
import { QuoteVerificationBadge } from './QuoteVerificationIndicator'
import * as styledEl from './RowQuoteId.styled'
import {
  formatQuoteIdReference,
  getQuoteIdString,
  type QuoteExpirationInput,
  type QuoteIdInput,
} from './RowQuoteId.utils'

import { RowStyleProps, StyledInfoIcon, StyledRowBetween, TextWrapper } from '../../pure/Row/styled'

interface QuoteIdValueProps {
  quoteId: string
}

interface RowQuoteIdProps {
  quoteId: QuoteIdInput
  isVerified?: boolean | null
  expiration?: QuoteExpirationInput
  styleProps?: RowStyleProps
}

export function QuoteIdValue({ quoteId }: QuoteIdValueProps): ReactNode {
  const { t } = useLingui()
  return (
    <styledEl.QuoteIdValueWrapper>
      <styledEl.QuoteIdReference>{formatQuoteIdReference(quoteId)}</styledEl.QuoteIdReference>
      <styledEl.CopyQuoteIdButton
        value={quoteId}
        timeoutMs={1500}
        iconSize={14}
        copiedLabel={<Trans>Copied!</Trans>}
        aria-label={t`Copy full quote ID`}
        onClick={(event) => event.stopPropagation()}
      />
    </styledEl.QuoteIdValueWrapper>
  )
}

export function RowQuoteId({ quoteId, isVerified, expiration, styleProps }: RowQuoteIdProps): ReactNode {
  const quoteIdString = getQuoteIdString(quoteId)

  if (!quoteIdString) return null

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          <styledEl.QuoteIdTransactionText>
            <Trans>Quote ID</Trans>
            <QuoteVerificationBadge isVerified={isVerified} />
          </styledEl.QuoteIdTransactionText>
        </TextWrapper>
        <HoverTooltip wrapInContainer content={<QuoteIdTooltipContent expiration={expiration} />}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right">
        <QuoteIdValue quoteId={quoteIdString} />
      </TextWrapper>
    </StyledRowBetween>
  )
}
