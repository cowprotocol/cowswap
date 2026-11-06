import { ReactNode, useCallback, useState } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { ButtonOutlined, ButtonPrimary, font, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { AlertTriangle, ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { NewModal, NewModalProps } from 'common/pure/NewModal'

import { SolanaTradeAmountsRow } from '../SolanaTradeAmountsRow'

export type SolanaOrderNotPlacedProps = NewModalProps & {
  errorMessage: string
  logs: string[] | null
  inputAmount: Nullish<CurrencyAmount<Currency>>
  outputAmount: Nullish<CurrencyAmount<Currency>>
}

export function SolanaOrderNotPlaced(props: SolanaOrderNotPlacedProps): ReactNode {
  const { errorMessage, logs, inputAmount, outputAmount, ...rest } = props
  const { onDismiss } = rest
  const [areDetailsOpen, setAreDetailsOpen] = useState(false)
  const [isCopied, copy] = useCopyClipboard()

  const toggleDetails = useCallback(() => setAreDetailsOpen((isOpen) => !isOpen), [])
  const onBackToReview = useCallback(() => onDismiss?.(), [onDismiss])
  const onCopyDetails = useCallback(() => copy(buildCopyPayload(errorMessage, logs)), [copy, errorMessage, logs])

  return (
    <NewModal {...rest} title={<Trans>Order not placed</Trans>} contentPadding="16px">
      <StatusGroup>
        <StatusPanel>
          <StatusHeadline>
            <AlertIcon size={48} />
            <StatusHeading>
              <Trans>Transaction checks failed</Trans>
            </StatusHeading>
            <StatusMessage>
              <Trans>The transaction didn't pass its checks, so your order wasn't submitted.</Trans>
            </StatusMessage>
          </StatusHeadline>

          <DetailsToggle onClick={toggleDetails} aria-expanded={areDetailsOpen}>
            {areDetailsOpen ? <Trans>Hide technical details</Trans> : <Trans>Show technical details</Trans>}
            <ToggleChevron size={16} $isOpen={areDetailsOpen} />
          </DetailsToggle>

          {areDetailsOpen && (
            <DetailsPanel>
              <DetailsLabel>
                <Trans>Error message</Trans>
              </DetailsLabel>
              <DetailsText>{errorMessage}</DetailsText>

              {logs && (
                <>
                  <DetailsLabel>
                    <Trans>Logs (excerpt)</Trans>
                  </DetailsLabel>
                  <DetailsText>{logs.join('\n')}</DetailsText>
                </>
              )}

              <CopyButton onClick={onCopyDetails}>
                {isCopied ? <Trans>Copied</Trans> : <Trans>Copy details</Trans>}
              </CopyButton>
            </DetailsPanel>
          )}
        </StatusPanel>

        <SolanaTradeAmountsRow inputAmount={inputAmount} outputAmount={outputAmount} />
      </StatusGroup>

      <BackToReviewButton onClick={onBackToReview}>
        <Trans>Back to review</Trans>
      </BackToReviewButton>
    </NewModal>
  )
}

function buildCopyPayload(errorMessage: string, logs: string[] | null): string {
  const errorBlock = `${t`Error message`}\n${errorMessage}`

  return logs ? `${errorBlock}\n\n${t`Logs (excerpt)`}\n${logs.join('\n')}` : errorBlock
}

const StatusGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  border-radius: 21px;
  overflow: hidden;
`

const StatusPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-height: 260px;
  padding: 24px 16px 16px;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
`

const StatusHeadline = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
`

const AlertIcon = styled(AlertTriangle)`
  stroke-width: 1.5;
  margin-bottom: 8px;
`

const StatusHeading = styled.span`
  ${font('FONT_MEDIUM', 'semibold')}
`

const StatusMessage = styled.span`
  ${font('FONT_NORMAL')}
`

const DetailsToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
  padding: 12px 0 0;
  border: 0;
  border-top: 1px solid currentColor;
  background: transparent;
  color: inherit;
  ${font('FONT_NORMAL', 'semibold')}
  cursor: pointer;
`

const ToggleChevron = styled(ChevronDown)<{ $isOpen: boolean }>`
  flex-shrink: 0;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
`

const DetailsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: var(${UI.COLOR_PAPER});
`

const DetailsLabel = styled.span`
  ${font('FONT_NORMAL', 'semibold')}

  &:not(:first-child) {
    margin-top: 12px;
  }
`

// `pre-wrap` so a multi-line log excerpt keeps its line breaks, and `break-word` so an address or
// a long single-line wallet message cannot push the modal wider than its container.
const DetailsText = styled.span`
  ${font('FONT_SMALL')}
  white-space: pre-wrap;
  word-break: break-word;
`

const CopyButton = styled(ButtonOutlined)`
  width: 100%;
  min-height: 40px;
  margin-top: 16px;
  background: var(${UI.COLOR_PAPER});
  ${font('FONT_NORMAL', 'medium')}
`

const BackToReviewButton = styled(ButtonPrimary)`
  width: 100%;
  min-height: 58px;
  margin-top: 16px;
  ${font('FONT_LARGE')}
`
