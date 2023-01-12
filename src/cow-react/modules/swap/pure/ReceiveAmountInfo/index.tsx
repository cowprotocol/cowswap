import React from 'react'
import { Box, GreenText, TextAmount, Column } from './styled'
import { ReceiveAmountInfo } from '@cow/modules/swap/helpers/tradeReceiveAmount'
import { Currency } from '@uniswap/sdk-core'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { Trans } from '@lingui/macro'

export interface ReceiveAmountInfoTooltipProps {
  receiveAmountInfo: ReceiveAmountInfo
  currency: Currency
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

export function ReceiveAmountInfoTooltip(props: ReceiveAmountInfoTooltipProps) {
  const { receiveAmountInfo, currency, subsidyAndBalance, allowsOffchainSigning } = props
  const { type, amountAfterFees, amountBeforeFees, feeAmount } = receiveAmountInfo
  const { subsidy } = subsidyAndBalance
  const { discount } = subsidy

  const typeString = type === 'from' ? '+' : '-'
  const hasFee = feeAmount !== '0'

  const FeePercent = (
    <span>
      <Trans>Fee</Trans>
      {hasFee && discount ? ` [-${discount}%]` : ''}
    </span>
  )

  return (
    <Box>
      <Column>
        <span>
          <Trans>Before fee</Trans>
        </span>
        <TextAmount>
          {/* // Split amountBeforeFees string into integers and decimals to style them differently (e.g. 1.2345 -> 1.23 45)  */}
          <span>{amountBeforeFees.split('.')[0]}</span>
          <span>.</span>
          <span>{amountBeforeFees.split('.')[1]}</span>
          <span>{currency.symbol}</span>
        </TextAmount>
      </Column>
      <Column>
        {discount ? <GreenText>{FeePercent}</GreenText> : FeePercent}
        {hasFee ? (
          <TextAmount>
            <span>
              {typeString}
              {feeAmount.split('.')[0]}
            </span>
            <span>.</span>
            <span>{feeAmount.split('.')[1]}</span>
            <span>{currency.symbol}</span>
          </TextAmount>
        ) : (
          <GreenText>
            <strong>
              <Trans>Free</Trans>
            </strong>
          </GreenText>
        )}
      </Column>
      {allowsOffchainSigning && (
        <Column>
          <span>
            <Trans>Gas cost</Trans>
          </span>
          <GreenText>
            <strong>
              <Trans>Free</Trans>
            </strong>
          </GreenText>
        </Column>
      )}
      <Column isTotal={true}>
        <span>
          <Trans>{type === 'from' ? 'From' : 'To'}</Trans>
        </span>
        <TextAmount>
          <span>{amountAfterFees.split('.')[0]}</span>
          <span>.</span>
          <span>{amountAfterFees.split('.')[1]}</span>
          <span>{currency.symbol}</span>
        </TextAmount>
      </Column>
    </Box>
  )
}
