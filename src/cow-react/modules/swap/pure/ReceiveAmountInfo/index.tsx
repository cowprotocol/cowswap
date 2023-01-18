import React from 'react'
import { Box, GreenText, TextAmount, Column } from './styled'
import { ReceiveAmountInfo } from '@cow/modules/swap/helpers/tradeReceiveAmount'
import { Currency } from '@uniswap/sdk-core'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { Trans } from '@lingui/macro'
import { DECIMAL_SEPARATOR } from '@cow/constants/format'
import { decomposeDecimal } from '@cow/utils/number'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'

const EXACT_DECIMALS = 4

function DecimalAmount(props: { prefix?: string; value: string; symbol?: string }) {
  const { prefix, value, symbol } = props
  const [integerPart, decimalPart] = decomposeDecimal(value, EXACT_DECIMALS)
  return (
    <TextAmount>
      <span>
        {prefix ? prefix + ' ' : ''}
        {integerPart}
      </span>
      <span>{DECIMAL_SEPARATOR}</span>
      <span>{decimalPart}</span>
      <span>{symbol}</span>
    </TextAmount>
  )
}

export interface ReceiveAmountInfoTooltipProps {
  receiveAmountInfo: ReceiveAmountInfo
  currency: Currency
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

export function ReceiveAmountInfoTooltip(props: ReceiveAmountInfoTooltipProps) {
  const isEthFlow = useIsEthFlow()

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
        <DecimalAmount value={amountBeforeFees} symbol={currency.symbol} />
      </Column>
      <Column>
        {discount ? <GreenText>{FeePercent}</GreenText> : FeePercent}
        {hasFee ? (
          <DecimalAmount prefix={typeString} value={feeAmount} symbol={currency.symbol} />
        ) : (
          <GreenText>
            <strong>
              <Trans>Free</Trans>
            </strong>
          </GreenText>
        )}
      </Column>
      {allowsOffchainSigning && !isEthFlow && (
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
        <DecimalAmount value={amountAfterFees} symbol={currency.symbol} />
      </Column>
    </Box>
  )
}
