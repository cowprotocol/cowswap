import { useContext } from 'react'

import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'

import { darken, transparentize } from 'polished'
import SVG from 'react-inlinesvg'
import styled, { ThemeContext } from 'styled-components/macro'

import AlertTriangle from 'legacy/assets/cow-swap/alert.svg'
import { MouseoverTooltipContent } from 'legacy/components/Tooltip'
import { ZERO_FRACTION } from 'legacy/constants'

import { HIGH_FEE_WARNING_PERCENTAGE } from 'common/constants/common'
import { calculateOrderExecutionStatus, ExecuteIndicator } from 'common/pure/OrderExecutionStatusList'
import { SymbolElement, TokenAmount, TokenAmountProps } from 'common/pure/TokenAmount'

import * as styledEl from './styled'

const MINUS_ONE_FRACTION = new Fraction(-1)

export const EstimatedExecutionPriceWrapper = styled.span<{ hasWarning: boolean; showPointerCursor: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: ${({ hasWarning, theme }) => (hasWarning ? darken(theme.darkMode ? 0 : 0.15, theme.alert) : 'inherit')};
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
  background: ${({ theme }) => transparentize(0.86, theme.attention)};
  color: ${({ theme }) => darken(0.15, theme.attention)};
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
        <MouseoverTooltipContent
          wrap={true}
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
        </MouseoverTooltipContent>
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
  const theme = useContext(ThemeContext)
  const { feePercentage, feeAmount } = props

  if (!feePercentage || !feeAmount) {
    return null
  }

  return (
    <styledEl.WarningIndicator hasBackground={false}>
      <MouseoverTooltipContent
        wrap={true}
        bgColor={theme.alert}
        content={
          <styledEl.WarningContent>
            <h3>Order unlikely to execute</h3>
            For this order, network fees would be <b>{feePercentage?.toFixed(2)}%</b>{' '}
            <b>
              <i>
                (<TokenAmount amount={feeAmount} round={false} tokenSymbol={feeAmount.currency} />)
              </i>
            </b>{' '}
            of your sell amount! Therefore, your order is unlikely to execute.
          </styledEl.WarningContent>
        }
        placement="bottom"
      >
        <SVG src={AlertTriangle} description="Alert" width="14" height="13" />
      </MouseoverTooltipContent>
    </styledEl.WarningIndicator>
  )
}
