import React, { ReactNode } from 'react'

import alertCircle from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import { Command } from '@cowprotocol/types'
import { ButtonSecondary, TokenSymbol, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import * as styledEl from './WarningTooltip.styled'

interface AllowanceWarningProps extends WarningProps {
  approve: Command
}

interface WarningProps {
  symbol: string
  isScheduled: boolean
  isPrototypeTwapBalanceIssue?: boolean
  prototypeTwapBalanceIssueScope?: 'parent' | 'child'
}

interface WarningTooltipProps {
  children?: ReactNode
  hasEnoughBalance: boolean
  hasEnoughAllowance: boolean
  inputTokenSymbol: string
  isPrototypeTwapBalanceIssue?: boolean
  prototypeTwapBalanceIssueScope?: 'parent' | 'child'
  isOrderScheduled: boolean
  onApprove: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WarningTooltip({
  children,
  hasEnoughBalance,
  hasEnoughAllowance,
  inputTokenSymbol,
  isPrototypeTwapBalanceIssue,
  prototypeTwapBalanceIssueScope,
  isOrderScheduled,
  onApprove,
}: WarningTooltipProps) {
  const withAllowanceWarning = !hasEnoughAllowance

  const tooltipContent = (
    <styledEl.WarningContent>
      {!hasEnoughBalance && (
        <BalanceWarning
          symbol={inputTokenSymbol}
          isScheduled={isOrderScheduled}
          isPrototypeTwapBalanceIssue={isPrototypeTwapBalanceIssue}
          prototypeTwapBalanceIssueScope={prototypeTwapBalanceIssueScope}
        />
      )}
      {withAllowanceWarning && (
        <AllowanceWarning approve={onApprove} symbol={inputTokenSymbol} isScheduled={isOrderScheduled} />
      )}
    </styledEl.WarningContent>
  )

  return (
    <styledEl.WarningIndicator hasBackground={false}>
      <styledEl.StyledQuestionHelper
        text={tooltipContent}
        placement="bottom"
        bgColor={`var(${UI.COLOR_DANGER_BG})`}
        color={`var(${UI.COLOR_DANGER_TEXT})`}
        Icon={<SVG src={alertCircle} description={t`warning`} width="14" height="14" />}
      />
      {children}
    </styledEl.WarningIndicator>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function AllowanceWarning({ symbol, isScheduled, approve }: AllowanceWarningProps) {
  return (
    <styledEl.WarningParagraph>
      <h3>
        <Trans>Insufficient token allowance</Trans>
      </h3>
      <p>
        {isScheduled ? (
          <>
            <Trans>Insufficient allowance granted for</Trans>{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>
            .{' '}
            <Trans>
              If allowance remains insufficient at creation time, this portion will not be created. Approve the
            </Trans>{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            <Trans>token before creation.</Trans>
          </>
        ) : (
          <>
            <Trans>The order remains open. Execution requires adequate allowance for</Trans>{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>
            . <Trans>Approve the token to proceed.</Trans>
          </>
        )}
      </p>
      <styledEl.WarningActionBox>
        <ButtonSecondary onClick={approve}>
          <Trans>Set approval</Trans>
        </ButtonSecondary>
      </styledEl.WarningActionBox>
    </styledEl.WarningParagraph>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function BalanceWarning({
  symbol,
  isScheduled,
  isPrototypeTwapBalanceIssue,
  prototypeTwapBalanceIssueScope,
}: WarningProps) {
  if (isPrototypeTwapBalanceIssue) {
    return (
      <styledEl.WarningParagraph>
        <h3>
          <Trans>Funds withdrawn from TWAP proxy account</Trans>
        </h3>
        <p>
          <Trans>Funds for this TWAP were withdrawn from your TWAP proxy account.</Trans>
          <br />
          <br />
          {prototypeTwapBalanceIssueScope === 'parent' ? (
            <Trans>
              One or more remaining TWAP parts will not execute. You can let the TWAP expire on its own or cancel it.
            </Trans>
          ) : isScheduled ? (
            <Trans>
              This scheduled TWAP part will not be created. You can let the TWAP expire on its own or cancel it.
            </Trans>
          ) : prototypeTwapBalanceIssueScope === 'child' ? (
            <Trans>This TWAP part will not execute. You can let the TWAP expire on its own or cancel it.</Trans>
          ) : (
            <Trans>
              One or more remaining TWAP parts will not execute. You can let the TWAP expire on its own or cancel it.
            </Trans>
          )}
        </p>
      </styledEl.WarningParagraph>
    )
  }

  return (
    <styledEl.WarningParagraph>
      <h3>
        <Trans>Insufficient token balance</Trans>
      </h3>
      <p>
        <Trans>Insufficient</Trans>{' '}
        <strong>
          <TokenSymbol token={{ symbol }} />
        </strong>{' '}
        <Trans>balance detected.</Trans>
        <br />
        <br />
        {isScheduled ? (
          <>
            <Trans>
              If the balance remains insufficient at creation time, this order portion will not be created. Add more
            </Trans>{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            <Trans>before that time.</Trans>
          </>
        ) : (
          <>
            <Trans>The order remains open. Execution requires sufficient</Trans>{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            <Trans>balance.</Trans>
          </>
        )}
      </p>
    </styledEl.WarningParagraph>
  )
}
