import { useContext } from 'react'
import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'
import styled, { ThemeContext } from 'styled-components/macro'
import { darken } from 'polished'
import SVG from 'react-inlinesvg'

import { MouseoverTooltipContent } from 'components/Tooltip'
import { TokenAmount, TokenAmountProps } from '@cow/common/pure/TokenAmount'
import AlertTriangle from 'assets/cow-swap/alert.svg'
import { calculateOrderExecutionStatus } from '@cow/modules/limitOrders/utils/calculateOrderExecutionStatus'
import * as styledEl from './styled'

const ZERO_FRACTION = new Fraction(0)
const MINUS_ONE_FRACTION = new Fraction(-1)
const TEN_PERCENT = new Percent(1, 10)

export const EstimatedExecutionPriceWrapper = styled.span<{ hasWarning: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ hasWarning, theme }) => (hasWarning ? darken(theme.darkMode ? 0 : 0.15, theme.alert) : 'inherit')};

  // Popover container override
  > div > div {
    display: flex;
    align-items: center;
  }
`

export type EstimatedExecutionPriceProps = TokenAmountProps & {
  isInverted: boolean
  percentageDifference?: Percent
  amountDifference?: CurrencyAmount<Currency>
  percentageFee?: Percent
  amountFee?: CurrencyAmount<Currency>
}

export function EstimatedExecutionPrice(props: EstimatedExecutionPriceProps) {
  const { isInverted, percentageDifference, amountDifference, percentageFee, amountFee, ...rest } = props

  // This amount can be negative (when price is inverted) and we don't want to show it negative
  const absoluteDifferenceAmount = amountDifference?.lessThan(ZERO_FRACTION)
    ? amountDifference.multiply(MINUS_ONE_FRACTION)
    : amountDifference
  const orderExecutionStatus = calculateOrderExecutionStatus(percentageDifference)
  const feeWarning = percentageFee?.greaterThan(TEN_PERCENT)
  const isNegativeDifference = percentageDifference?.lessThan(ZERO_FRACTION)

  return (
    <EstimatedExecutionPriceWrapper hasWarning={!!feeWarning}>
      <MouseoverTooltipContent
        wrap={true}
        content={
          <styledEl.ExecuteInformationTooltip>
            {!isNegativeDifference ? (
              <>
                Market price needs to go {isInverted ? 'down 📉' : 'up 📈'} by&nbsp;
                <b>
                  <TokenAmount {...rest} amount={absoluteDifferenceAmount} round={false} />
                </b>
                &nbsp;
                <b>
                  <i>(~{percentageDifference?.toFixed(2)}%)</i>
                </b>
                &nbsp;to execute your order.
              </>
            ) : feeWarning ? (
              <>Unlikely to execute due to high fee</>
            ) : (
              <>Will execute soon!</>
            )}
          </styledEl.ExecuteInformationTooltip>
        }
        placement="top"
      >
        <styledEl.ExecuteIndicator status={orderExecutionStatus} />
        <TokenAmount {...rest} />
      </MouseoverTooltipContent>

      {feeWarning && <UnlikelyToExecuteWarning feePercentage={percentageFee} feeAmount={amountFee} />}
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
