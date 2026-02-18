import { type MouseEvent, type ReactNode, useCallback } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { Check, Copy } from 'react-feather'
import styled from 'styled-components/macro'

import { formatQuoteIdReference, getQuoteIdString, type QuoteExpirationInput, type QuoteIdInput } from './quoteId'
import { QuoteIdTooltipContent } from './QuoteIdTooltipContent'
import { QuoteVerificationBadge } from './QuoteVerificationIndicator'

import { RowStyleProps, StyledInfoIcon, StyledRowBetween, TextWrapper, TransactionText } from '../../pure/Row/styled'

const QuoteIdValueWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  line-height: 1;
`

const QuoteIdReference = styled.span`
  white-space: nowrap;
`

const QuoteIdTransactionText = styled(TransactionText)`
  align-items: center;
`

const CopyQuoteIdButton = styled(LinkStyledButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0;
  line-height: 0;
  opacity: 0.8;

  &:hover,
  &:focus {
    text-decoration: none;
    opacity: 1;
  }
`

const CopiedLabel = styled.span`
  color: var(${UI.COLOR_SUCCESS});
  font-size: 11px;
  line-height: 1;
`

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
    <QuoteIdValueWrapper>
      <QuoteIdReference>{formatQuoteIdReference(quoteId)}</QuoteIdReference>
      <CopyQuoteIdButton onClick={handleCopy} aria-label={t`Copy full quote ID`}>
        {isCopied ? (
          <>
            <Check size={14} />
            <CopiedLabel>
              <Trans>Copied!</Trans>
            </CopiedLabel>
          </>
        ) : (
          <Copy size={14} />
        )}
      </CopyQuoteIdButton>
    </QuoteIdValueWrapper>
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
          <QuoteIdTransactionText>
            <Trans>Quote ID</Trans>
            <QuoteVerificationBadge isVerified={isVerified} />
          </QuoteIdTransactionText>
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
