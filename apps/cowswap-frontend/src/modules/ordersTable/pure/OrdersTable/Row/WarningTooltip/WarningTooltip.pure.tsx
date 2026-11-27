import { ReactNode } from 'react'

import svgFilledInfoCircleSrc from '@cowprotocol/assets/cow-swap/filled-info-circle.svg'
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
}

interface WarningTooltipProps {
  children?: ReactNode
  hasEnoughBalance: boolean
  hasEnoughAllowance: boolean
  inputTokenSymbol: string
  isOrderScheduled: boolean
  onApprove: Command
}

// Shown on the status badge of a TWAP order (and its open parts) whose Safe ComposableCoW fallback
// handler was reset, so open orders can no longer be created (see issue #5426).
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FallbackHandlerWarningTooltip({ children }: { children?: ReactNode }) {
  const tooltipContent = (
    <styledEl.WarningContent>
      <styledEl.WarningParagraph>
        <h3>
          <Trans>Update fallback handler</Trans>
        </h3>
        <p>
          <Trans>
            Your Safe fallback handler was changed after TWAP orders were placed. All open TWAP orders are not getting
            created because of that. Please, update the fallback handler in order to make the orders work again.
          </Trans>
        </p>
      </styledEl.WarningParagraph>
    </styledEl.WarningContent>
  )

  return (
    <styledEl.WarningIndicator hasBackground={false}>
      <styledEl.StyledQuestionHelper
        text={tooltipContent}
        placement="bottom"
        bgColor={`var(${UI.COLOR_DANGER_BG})`}
        color={`var(${UI.COLOR_DANGER_TEXT})`}
        Icon={<SVG src={svgFilledInfoCircleSrc} description={t`warning`} width="14" height="14" />}
      />
      {children}
    </styledEl.WarningIndicator>
  )
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
        Icon={<SVG src={svgFilledInfoCircleSrc} description={t`warning`} width="14" height="14" />}
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
          <Trans>
            Insufficient allowance granted for{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>
            . If allowance remains insufficient at creation time, this portion will not be created. Approve the{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            token before creation.
          </Trans>
        ) : (
          <Trans>
            The order remains open. Execution requires adequate allowance for{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>
            . Approve the token to proceed.
          </Trans>
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
function BalanceWarning({ symbol, isScheduled }: WarningProps) {
  return (
    <styledEl.WarningParagraph>
      <h3>
        <Trans>Insufficient token balance</Trans>
      </h3>
      <p>
        <Trans>
          Insufficient{' '}
          <strong>
            <TokenSymbol token={{ symbol }} />
          </strong>{' '}
          balance detected.
        </Trans>
        <br />
        <br />
        {isScheduled ? (
          <Trans>
            If the balance remains insufficient at creation time, this order portion will not be created. Add more{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            before that time.
          </Trans>
        ) : (
          <Trans>
            The order remains open. Execution requires sufficient{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            balance.
          </Trans>
        )}
      </p>
    </styledEl.WarningParagraph>
  )
}
