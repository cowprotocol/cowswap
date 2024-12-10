import React from 'react'

import AlertTriangle from '@cowprotocol/assets/cow-swap/alert.svg'
import { Command } from '@cowprotocol/types'
import { ButtonSecondary, TokenSymbol, UI, HoverTooltip } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

interface WarningProps {
  symbol: string
  isScheduled: boolean
}

interface AllowanceWarningProps extends WarningProps {
  approve: Command
}

function BalanceWarning({ symbol, isScheduled }: WarningProps) {
  return (
    <styledEl.WarningParagraph>
      <h3>Insufficient token balance</h3>
      <p>
        Insufficient{' '}
        <strong>
          <TokenSymbol token={{ symbol }} />
        </strong>{' '}
        balance detected.
        <br />
        <br />
        {isScheduled ? (
          <>
            If the balance remains insufficient at creation time, this order portion will not be created. Add more{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            before that time.
          </>
        ) : (
          <>
            The order remains open. Execution requires sufficient{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            balance.
          </>
        )}
      </p>
    </styledEl.WarningParagraph>
  )
}

function AllowanceWarning({ symbol, isScheduled, approve }: AllowanceWarningProps) {
  return (
    <styledEl.WarningParagraph>
      <h3>Insufficient token allowance</h3>
      <p>
        {isScheduled ? (
          <>
            Insufficient allowance granted for{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>
            . If allowance remains insufficient at creation time, this portion will not be created. Approve the{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            token before creation.
          </>
        ) : (
          <>
            The order remains open. Execution requires adequate allowance for{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>
            . Approve the token to proceed.
          </>
        )}
      </p>
      <styledEl.WarningActionBox>
        <ButtonSecondary onClick={approve}>Set allowance</ButtonSecondary>
      </styledEl.WarningActionBox>
    </styledEl.WarningParagraph>
  )
}

interface WarningTooltipProps {
  children: React.ReactNode
  hasEnoughBalance: boolean
  hasEnoughAllowance: boolean
  hasValidPendingPermit: boolean | undefined
  inputTokenSymbol: string
  isOrderScheduled: boolean
  onApprove: Command
  showIcon?: boolean
}

export function WarningTooltip({
  children,
  hasEnoughBalance,
  hasEnoughAllowance,
  hasValidPendingPermit,
  inputTokenSymbol,
  isOrderScheduled,
  onApprove,
  showIcon = false,
}: WarningTooltipProps) {
  const withAllowanceWarning =
    hasEnoughAllowance === false && (hasValidPendingPermit === false || hasValidPendingPermit === undefined)

  const tooltipContent = (
    <styledEl.WarningContent>
      {hasEnoughBalance === false && <BalanceWarning symbol={inputTokenSymbol} isScheduled={isOrderScheduled} />}
      {withAllowanceWarning && (
        <AllowanceWarning approve={onApprove} symbol={inputTokenSymbol} isScheduled={isOrderScheduled} />
      )}
    </styledEl.WarningContent>
  )

  if (showIcon) {
    return (
      <styledEl.WarningIndicator>
        <styledEl.StyledQuestionHelper
          text={tooltipContent}
          placement="bottom"
          bgColor={`var(${UI.COLOR_ALERT})`}
          color={`var(${UI.COLOR_ALERT_TEXT_DARKER})`}
          Icon={<SVG src={AlertTriangle} description="Alert" width="14" height="13" />}
        />
        {children}
      </styledEl.WarningIndicator>
    )
  }

  return (
    <HoverTooltip
      content={tooltipContent}
      placement="bottom"
      bgColor={`var(${UI.COLOR_ALERT})`}
      color={`var(${UI.COLOR_ALERT_TEXT_DARKER})`}
    >
      {children}
    </HoverTooltip>
  )
}
