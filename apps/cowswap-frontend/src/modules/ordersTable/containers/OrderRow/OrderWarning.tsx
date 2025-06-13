import React, { ReactNode } from 'react'

import alertCircle from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import { Command } from '@cowprotocol/types'
import { ButtonSecondary, TokenSymbol, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

interface WarningProps {
  symbol: string
  isScheduled: boolean
}

interface AllowanceWarningProps extends WarningProps {
  approve: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
        <ButtonSecondary onClick={approve}>Set approval</ButtonSecondary>
      </styledEl.WarningActionBox>
    </styledEl.WarningParagraph>
  )
}

interface WarningTooltipProps {
  children?: ReactNode
  hasEnoughBalance: boolean
  hasEnoughAllowance: boolean
  inputTokenSymbol: string
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
  isOrderScheduled,
  onApprove,
}: WarningTooltipProps) {
  const withAllowanceWarning = !hasEnoughAllowance

  const tooltipContent = (
    <styledEl.WarningContent>
      {!hasEnoughBalance && <BalanceWarning symbol={inputTokenSymbol} isScheduled={isOrderScheduled} />}
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
        Icon={<SVG src={alertCircle} description="warning" width="14" height="14" />}
      />
      {children}
    </styledEl.WarningIndicator>
  )
}
