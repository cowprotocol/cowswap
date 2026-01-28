import { useEffect, useState } from 'react'

import AlertTriangle from '@cowprotocol/assets/cow-swap/alert.svg'
import allowanceIcon from '@cowprotocol/assets/images/icon-allowance.svg'
import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import {
  ButtonSecondary,
  HoverTooltip,
  Loader,
  TokenAmount,
  TokenAmountProps,
  UI,
} from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Fraction, Percent, Price } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import { Nullish } from 'types'

import { HIGH_FEE_WARNING_PERCENTAGE, PENDING_EXECUTION_THRESHOLD_PERCENTAGE } from 'common/constants/common'

import * as orderRowEl from '../../containers/OrderRow/OrderRow.styled'
import * as warningTooltopEl from '../OrdersTable/Row/WarningTooltip/WarningTooltip.styled'
import * as styledEl from './OrderEstimatedExecutionPrice.styled'

const MINUS_ONE_FRACTION = new Fraction(-1)

export interface OrderEstimatedExecutionPriceProps extends TokenAmountProps {
  amountDifference?: CurrencyAmount<Currency>
  amountFee?: CurrencyAmount<Currency>
  canShowWarning: boolean
  executesAtPrice?: Nullish<Price<Currency, Currency>>
  isInverted: boolean
  isUnfillable: boolean
  marketPrice?: Nullish<Price<Currency, Currency>>
  onApprove?: Command
  percentageDifference?: Percent
  percentageFee?: Percent
  warningText?: string
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function OrderEstimatedExecutionPrice({
  amount,
  amountDifference,
  amountFee,
  canShowWarning,
  executesAtPrice,
  isInverted,
  isUnfillable,
  marketPrice,
  onApprove,
  percentageDifference,
  percentageFee,
  tokenSymbol,
  warningText,
  ...rest
}: OrderEstimatedExecutionPriceProps) {
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

  const internationalizedWarningText =
    warningText === 'Insufficient balance'
      ? t`Insufficient balance`
      : warningText === 'Insufficient allowance'
        ? t`Insufficient allowance`
        : t`Unfillable`

  const unfillableLabel = (
    <styledEl.UnfillableLabel>
      {(warningText === 'Insufficient allowance' || warningText === 'Insufficient balance') && (
        <>
          <HoverTooltip
            content={
              <warningTooltopEl.WarningContent>
                <h3>{internationalizedWarningText}</h3>
                <p>
                  {warningText === 'Insufficient allowance'
                    ? t`The order remains open. Execution requires adequate allowance. Approve the token to proceed.`
                    : t`The order remains open. Execution requires sufficient balance.`}
                </p>
                {warningText === 'Insufficient allowance' && handleApproveClick && (
                  <warningTooltopEl.WarningActionBox>
                    {approveClicked ? (
                      <styledEl.ApproveLoaderWrapper>
                        <Loader />
                      </styledEl.ApproveLoaderWrapper>
                    ) : (
                      <ButtonSecondary onClick={handleApproveClick}>
                        <Trans>Set approval</Trans>
                      </ButtonSecondary>
                    )}
                  </warningTooltopEl.WarningActionBox>
                )}
              </warningTooltopEl.WarningContent>
            }
            bgColor={`var(${UI.COLOR_DANGER_BG})`}
            color={`var(${UI.COLOR_DANGER_TEXT})`}
          >
            <styledEl.WarningContent>
              <SVG src={allowanceIcon} />
              {internationalizedWarningText}
            </styledEl.WarningContent>
          </HoverTooltip>
          {warningText === 'Insufficient allowance' &&
            handleApproveClick &&
            (approveClicked ? (
              <Loader />
            ) : (
              <styledEl.ApprovalLink onClick={handleApproveClick}>
                <Trans>Set approval</Trans>
              </styledEl.ApprovalLink>
            ))}
        </>
      )}
    </styledEl.UnfillableLabel>
  )

  const marketPriceDirection = marketPriceNeedsToGoDown ? t`down` + ` 📉` : t`up` + ` 📈`
  const percentageDifferenceInvertedFormatted = percentageDifferenceInverted?.toFixed(2)

  return (
    <styledEl.OrderEstimatedExecutionPriceWrapper $hasWarning={!!feeWarning} $showPointerCursor={!isUnfillable}>
      {isUnfillable ? (
        <div>{unfillableLabel}</div>
      ) : !absoluteDifferenceAmount ? (
        <span>{content}</span>
      ) : (
        <HoverTooltip
          wrapInContainer={true}
          content={
            <orderRowEl.ExecuteInformationTooltip>
              {isNegativeDifference && isMarketPriceReached ? (
                <Trans>The fill price of this order is close or at the market price and is expected to fill soon</Trans>
              ) : (
                <>
                  <Trans>
                    Current market price is{' '}
                    <b>
                      <TokenAmount
                        amount={marketPrice}
                        round={false}
                        tokenSymbol={marketPrice?.quoteCurrency}
                        {...rest}
                      />
                    </b>{' '}
                    and needs to go {marketPriceDirection} by{' '}
                    <b>
                      <TokenAmount {...rest} amount={absoluteDifferenceAmount} round={false} />
                    </b>{' '}
                    <span>
                      (<i>{percentageDifferenceInvertedFormatted}%</i>)
                    </span>{' '}
                    to execute your order at{' '}
                    <b>
                      <TokenAmount
                        amount={executesAtPrice}
                        {...rest}
                        round={false}
                        tokenSymbol={executesAtPrice?.quoteCurrency}
                      />
                    </b>
                    .
                  </Trans>
                  <orderRowEl.ExecuteInformationTooltipWarning>
                    <Trans>
                      This price is taken from external sources and may not accurately reflect the current on-chain
                      price.
                    </Trans>
                  </orderRowEl.ExecuteInformationTooltipWarning>
                </>
              )}
            </orderRowEl.ExecuteInformationTooltip>
          }
          placement="top"
        >
          {content}
        </HoverTooltip>
      )}
      {feeWarning && !isNegativeDifference && (
        <UnlikelyToExecuteWarning feePercentage={percentageFee} feeAmount={amountFee} />
      )}
    </styledEl.OrderEstimatedExecutionPriceWrapper>
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
    <warningTooltopEl.WarningIndicator hasBackground={false}>
      <HoverTooltip
        wrapInContainer={true}
        placement="bottom"
        bgColor={`var(${UI.COLOR_ALERT_BG})`}
        color={`var(${UI.COLOR_ALERT_TEXT})`}
        content={
          <warningTooltopEl.WarningContent>
            <h3>
              <Trans>Order unlikely to execute</Trans>
            </h3>
            <Trans>For this order, network costs would be</Trans> <b>{feePercentage?.toFixed(2)}%</b>{' '}
            <b>
              <i>
                (<TokenAmount amount={feeAmount} round={false} tokenSymbol={feeAmount.currency} />)
              </i>
            </b>{' '}
            <Trans>of your sell amount! Therefore, your order is unlikely to execute.</Trans>
          </warningTooltopEl.WarningContent>
        }
      >
        <SVG src={AlertTriangle} description={t`Alert`} width="14" height="13" />
      </HoverTooltip>
    </warningTooltopEl.WarningIndicator>
  )
}
