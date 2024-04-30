import AlertTriangle from '@cowprotocol/assets/cow-swap/alert.svg'
import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { UI } from '@cowprotocol/ui'
import { SymbolElement, TokenAmount, TokenAmountProps } from '@cowprotocol/ui'
import { HoverTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'

import { darken } from 'color2k'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { HIGH_FEE_WARNING_PERCENTAGE } from 'common/constants/common'
import { calculateOrderExecutionStatus, ExecuteIndicator } from 'common/pure/OrderExecutionStatusList'

import * as styledEl from './styled'

const MINUS_ONE_FRACTION = new Fraction(-1)

export const EstimatedExecutionPriceWrapper = styled.span<{ hasWarning: boolean; showPointerCursor: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: ${({ hasWarning, theme }) => (hasWarning ? darken(theme.alert, theme.darkMode ? 0 : 0.15) : 'inherit')};
  cursor: ${({ showPointerCursor }) => (showPointerCursor ? 'pointer' : 'default')};

  ${SymbolElement} {
    color: inherit;
  }

  // Triangle warning icon override
  ${styledEl.WarningIndicator} {
    padding: 0 0 0 3px;

    svg {
      --size: 18px;
      width: var(--size);
      height: var(--size);
      min-width: var(--size);
      min-height: var(--size);
    }
  }

  // Popover container override
  > div > div,
  > span {
    display: flex;
    align-items: center;
  }
`

const UnfillableLabel = styled.span`
  width: 100%;
  max-width: 90px;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  position: relative;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 2px;
  margin: 0 4px 0 0;
  letter-spacing: 0.2px;
  text-transform: uppercase;
`

export type EstimatedExecutionPriceProps = TokenAmountProps & {
  isInverted: boolean
  isUnfillable: boolean
  canShowWarning: boolean
  percentageDifference?: Percent
  amountDifference?: CurrencyAmount<Currency>
  percentageFee?: Percent
  amountFee?: CurrencyAmount<Currency>
}

export function EstimatedExecutionPrice(props: EstimatedExecutionPriceProps) {
  const {
    isInverted,
    isUnfillable,
    canShowWarning,
    percentageDifference,
    amountDifference,
    percentageFee,
    amountFee,
    amount,
    ...rest
  } = props

  const percentageDifferenceInverted = isInverted
    ? percentageDifference?.multiply(MINUS_ONE_FRACTION)
    : percentageDifference

  // This amount can be negative (when price is inverted) and we don't want to show it negative
  const absoluteDifferenceAmount = amountDifference?.lessThan(ZERO_FRACTION)
    ? amountDifference.multiply(MINUS_ONE_FRACTION)
    : amountDifference
  const orderExecutionStatus = calculateOrderExecutionStatus(percentageDifferenceInverted)
  const feeWarning = canShowWarning && percentageFee?.greaterThan(HIGH_FEE_WARNING_PERCENTAGE)
  const isNegativeDifference = percentageDifferenceInverted?.lessThan(ZERO_FRACTION)
  const marketPriceNeedsToGoDown = isInverted ? !isNegativeDifference : isNegativeDifference

  const content = (
    <>
      <ExecuteIndicator status={orderExecutionStatus} />
      <TokenAmount amount={amount} {...rest} />
    </>
  )

  return (
    <EstimatedExecutionPriceWrapper hasWarning={!!feeWarning} showPointerCursor={!isUnfillable}>
      {isUnfillable ? (
        <UnfillableLabel>UNFILLABLE</UnfillableLabel>
      ) : !absoluteDifferenceAmount ? (
        <span>{content}</span>
      ) : (
        <HoverTooltip
          wrapInContainer={true}
          content={
            <styledEl.ExecuteInformationTooltip>
              {!isNegativeDifference ? (
                <>
                  Market price needs to go {marketPriceNeedsToGoDown ? 'down 📉' : 'up 📈'} by&nbsp;
                  <b>
                    <TokenAmount {...rest} amount={absoluteDifferenceAmount} round={false} />
                  </b>
                  &nbsp;
                  <span>
                    (<i>{percentageDifferenceInverted?.toFixed(2)}%</i>)
                  </span>
                  &nbsp;to execute your order.
                </>
              ) : (
                <>Will execute soon!</>
              )}
            </styledEl.ExecuteInformationTooltip>
          }
          placement="top"
        >
          {content}
        </HoverTooltip>
      )}
      {feeWarning && !isNegativeDifference && (
        <UnlikelyToExecuteWarning feePercentage={percentageFee} feeAmount={amountFee} />
      )}
    </EstimatedExecutionPriceWrapper>
  )
}

export type UnlikelyToExecuteWarningProps = {
  feePercentage?: Percent
  feeAmount?: CurrencyAmount<Currency>
}

export function UnlikelyToExecuteWarning(props: UnlikelyToExecuteWarningProps) {
  const { feePercentage, feeAmount } = props

  if (!feePercentage || !feeAmount) {
    return null
  }

  return (
    <styledEl.WarningIndicator hasBackground={false}>
      <HoverTooltip
        wrapInContainer={true}
        placement="bottom"
        bgColor={`var(${UI.COLOR_ALERT_BG})`}
        color={`var(${UI.COLOR_ALERT_TEXT})`}
        content={
          <styledEl.WarningContent>
            <h3>Order unlikely to execute</h3>
            For this order, network costs would be <b>{feePercentage?.toFixed(2)}%</b>{' '}
            <b>
              <i>
                (<TokenAmount amount={feeAmount} round={false} tokenSymbol={feeAmount.currency} />)
              </i>
            </b>{' '}
            of your sell amount! Therefore, your order is unlikely to execute.
          </styledEl.WarningContent>
        }
      >
        <SVG src={AlertTriangle} description="Alert" width="14" height="13" />
      </HoverTooltip>
    </styledEl.WarningIndicator>
  )
}
