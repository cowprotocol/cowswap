import { useEffect, useState } from 'react'

import AlertTriangle from '@cowprotocol/assets/cow-swap/alert.svg'
import allowanceIcon from '@cowprotocol/assets/images/icon-allowance.svg'
import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import {
  ButtonSecondary,
  HoverTooltip,
  Loader,
  SymbolElement,
  TokenAmount,
  TokenAmountProps,
  UI,
} from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Fraction, Percent, Price } from '@uniswap/sdk-core'

import { darken } from 'color2k'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { HIGH_FEE_WARNING_PERCENTAGE, PENDING_EXECUTION_THRESHOLD_PERCENTAGE } from 'common/constants/common'

import * as styledEl from './styled'

const MINUS_ONE_FRACTION = new Fraction(-1)

export const EstimatedExecutionPriceWrapper = styled.span<{ $hasWarning: boolean; $showPointerCursor: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: ${({ $hasWarning, theme }) => ($hasWarning ? darken(theme.alert, theme.darkMode ? 0 : 0.15) : 'inherit')};
  cursor: ${({ $showPointerCursor }) => ($showPointerCursor ? 'pointer' : 'default')};

  ${SymbolElement} {
    color: inherit;
  }

  // Popover container override

  > div > div,
  > span {
    display: flex;
    align-items: center;
  }
`

const UnfillableLabel = styled.span`
  width: auto;
  color: var(${UI.COLOR_DANGER});
  position: relative;
  display: flex;
  align-items: center;
  font-size: inherit;
  font-weight: 500;
  line-height: 1.1;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 3px;

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  svg > path {
    fill: currentColor;
    stroke: none;
  }
`

const WarningContent = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: help;
`

const ApprovalLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: inherit;
  color: inherit;
  text-decoration: underline;
  color: var(${UI.COLOR_PRIMARY});
  font-weight: 500;

  &:hover {
    opacity: 1;
  }
`

const ApproveLoaderWrapper = styled.div`
  text-align: center;
  width: 100%;
`

export type EstimatedExecutionPriceProps = TokenAmountProps & {
  isInverted: boolean
  isUnfillable: boolean
  canShowWarning: boolean
  percentageDifference?: Percent
  amountDifference?: CurrencyAmount<Currency>
  percentageFee?: Percent
  amountFee?: CurrencyAmount<Currency>
  marketPrice?: Nullish<Price<Currency, Currency>>
  executesAtPrice?: Nullish<Price<Currency, Currency>>
  warningText?: string
  onApprove?: Command
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function EstimatedExecutionPrice(props: EstimatedExecutionPriceProps) {
  const {
    amount,
    tokenSymbol,
    isInverted,
    isUnfillable,
    canShowWarning,
    percentageDifference,
    amountDifference,
    percentageFee,
    marketPrice,
    executesAtPrice,
    amountFee,
    warningText,
    onApprove,
    ...rest
  } = props

  const [approveClicked, setApproveClicked] = useState(true)
  const handleApproveClick =
    onApprove &&
    (() => {
      onApprove()
      setApproveClicked(true)
    })

  const percentageDifferenceInverted = isInverted
    ? percentageDifference?.multiply(MINUS_ONE_FRACTION)
    : percentageDifference

  // This amount can be negative (when price is inverted) and we don't want to show it negative
  const absoluteDifferenceAmount = amountDifference?.lessThan(ZERO_FRACTION)
    ? amountDifference.multiply(MINUS_ONE_FRACTION)
    : amountDifference

  const feeWarning = canShowWarning && percentageFee?.greaterThan(HIGH_FEE_WARNING_PERCENTAGE)
  const isNegativeDifference = percentageDifferenceInverted?.lessThan(ZERO_FRACTION)
  const marketPriceNeedsToGoDown = isInverted ? !isNegativeDifference : isNegativeDifference

  const isMarketPriceReached =
    Math.abs(Number(percentageDifferenceInverted?.toFixed(4) ?? 0)) <= PENDING_EXECUTION_THRESHOLD_PERCENTAGE

  const content = (
    <>
      <TokenAmount amount={amount} tokenSymbol={tokenSymbol} clickable {...rest} />
    </>
  )

  // Reset approveClicked state after 3 seconds
  useEffect(() => {
    if (!approveClicked) return

    const timeout = setTimeout(() => {
      setApproveClicked(false)
    }, 3_000)

    return () => clearTimeout(timeout)
  }, [approveClicked])

  const unfillableLabel = (
    <UnfillableLabel>
      {(warningText === 'Insufficient allowance' || warningText === 'Insufficient balance') && (
        <>
          <HoverTooltip
            content={
              <styledEl.WarningContent>
                <h3>{warningText}</h3>
                <p>
                  {warningText === 'Insufficient allowance'
                    ? 'The order remains open. Execution requires adequate allowance. Approve the token to proceed.'
                    : 'The order remains open. Execution requires sufficient balance.'}
                </p>
                {warningText === 'Insufficient allowance' && handleApproveClick && (
                  <styledEl.WarningActionBox>
                    {approveClicked ? (
                      <ApproveLoaderWrapper>
                        <Loader />
                      </ApproveLoaderWrapper>
                    ) : (
                      <ButtonSecondary onClick={handleApproveClick}>Set approval</ButtonSecondary>
                    )}
                  </styledEl.WarningActionBox>
                )}
              </styledEl.WarningContent>
            }
            bgColor={`var(${UI.COLOR_DANGER_BG})`}
            color={`var(${UI.COLOR_DANGER_TEXT})`}
          >
            <WarningContent>
              <SVG src={allowanceIcon} />
              {warningText}
            </WarningContent>
          </HoverTooltip>
          {warningText === 'Insufficient allowance' &&
            handleApproveClick &&
            (approveClicked ? <Loader /> : <ApprovalLink onClick={handleApproveClick}>Set approval</ApprovalLink>)}
        </>
      )}
    </UnfillableLabel>
  )

  return (
    <EstimatedExecutionPriceWrapper $hasWarning={!!feeWarning} $showPointerCursor={!isUnfillable}>
      {isUnfillable ? (
        <div>{unfillableLabel}</div>
      ) : !absoluteDifferenceAmount ? (
        <span>{content}</span>
      ) : (
        <HoverTooltip
          wrapInContainer={true}
          content={
            <styledEl.ExecuteInformationTooltip>
              {isNegativeDifference && isMarketPriceReached ? (
                <>The fill price of this order is close or at the market price and is expected to fill soon</>
              ) : (
                <>
                  Current market price is&nbsp;
                  <b>
                    <TokenAmount
                      amount={marketPrice}
                      {...rest}
                      round={false}
                      tokenSymbol={marketPrice?.quoteCurrency}
                    />
                  </b>
                  and needs to go {marketPriceNeedsToGoDown ? 'down 📉' : 'up 📈'} by&nbsp;
                  <b>
                    <TokenAmount {...rest} amount={absoluteDifferenceAmount} round={false} />
                  </b>
                  &nbsp;
                  <span>
                    (<i>{percentageDifferenceInverted?.toFixed(2)}%</i>)
                  </span>
                  to execute your order at&nbsp;
                  <b>
                    <TokenAmount
                      amount={executesAtPrice}
                      {...rest}
                      round={false}
                      tokenSymbol={executesAtPrice?.quoteCurrency}
                    />
                  </b>
                  .
                    <styledEl.ExecuteInformationTooltipWarning>
                    This price is taken from external sources and may not accurately reflect the current on-chain price.
                  </styledEl.ExecuteInformationTooltipWarning>
                </>
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

type UnlikelyToExecuteWarningProps = {
  feePercentage?: Percent
  feeAmount?: CurrencyAmount<Currency>
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function UnlikelyToExecuteWarning(props: UnlikelyToExecuteWarningProps) {
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
