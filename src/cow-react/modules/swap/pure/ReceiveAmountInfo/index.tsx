import React from 'react'
import * as styledEl from './styled'
import { ReceiveAmountInfo } from '@cow/modules/swap/helpers/tradeReceiveAmount'
import { Currency } from '@uniswap/sdk-core'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { Trans } from '@lingui/macro'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'

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
    <styledEl.Box>
      <div>
        <span>
          <Trans>Before fee</Trans>
        </span>
        <span>
          {amountBeforeFees} {currency.symbol}
        </span>
      </div>
      <div>
        {discount ? <styledEl.GreenText>{FeePercent}</styledEl.GreenText> : FeePercent}
        {hasFee ? (
          <span>
            {typeString}
            {feeAmount} {currency.symbol}
          </span>
        ) : (
          <styledEl.GreenText>
            <strong>
              <Trans>Free</Trans>
            </strong>
          </styledEl.GreenText>
        )}
      </div>
      {allowsOffchainSigning && !isEthFlow && (
        <div>
          <span>
            <Trans>Gas cost</Trans>
          </span>
          <styledEl.GreenText>
            <strong>
              <Trans>Free</Trans>
            </strong>
          </styledEl.GreenText>
        </div>
      )}
      <styledEl.TotalAmount>
        <span>
          <Trans>{type === 'from' ? 'From' : 'To'}</Trans>
        </span>
        <span>
          {amountAfterFees} {currency.symbol}
        </span>
      </styledEl.TotalAmount>
    </styledEl.Box>
  )
}
