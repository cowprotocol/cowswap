import { type MouseEvent, type ReactNode, useCallback } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { HoverTooltip, RowFixed } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { Check, Copy } from 'react-feather'

import { formatQuoteIdReference, getQuoteIdString, type QuoteExpirationInput, type QuoteIdInput } from './quoteId'
import { QuoteIdTooltipContent } from './QuoteIdTooltipContent'
import { QuoteVerificationBadge } from './QuoteVerificationIndicator'
import * as styledEl from './RowQuoteId.styled'

import { RowStyleProps, StyledInfoIcon, StyledRowBetween, TextWrapper } from '../../pure/Row/styled'

interface QuoteIdValueProps {
  quoteId: string
}

export function QuoteIdValue({ quoteId }: QuoteIdValueProps): ReactNode {
  const { t } = useLingui()
  const [isCopied, setCopied] = useCopyClipboard(1500)

  const handleCopy = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      setCopied(quoteId)
    },
    [quoteId, setCopied],
  )

  return (
    <styledEl.QuoteIdValueWrapper>
      <styledEl.QuoteIdReference>{formatQuoteIdReference(quoteId)}</styledEl.QuoteIdReference>
      <styledEl.CopyQuoteIdButton onClick={handleCopy} aria-label={t`Copy full quote ID`}>
        {isCopied ? (
          <>
            <Check size={14} />
            <styledEl.CopiedLabel>
              <Trans>Copied!</Trans>
            </styledEl.CopiedLabel>
          </>
        ) : (
          <Copy size={14} />
        )}
      </styledEl.CopyQuoteIdButton>
    </styledEl.QuoteIdValueWrapper>
  )
}

interface RowQuoteIdProps {
  quoteId: QuoteIdInput
  isVerified?: boolean | null
  expiration?: QuoteExpirationInput
  styleProps?: RowStyleProps
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
