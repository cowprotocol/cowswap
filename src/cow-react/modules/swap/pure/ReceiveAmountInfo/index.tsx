import React from 'react'
import * as styledEl from './styled'
import { ReceiveAmountInfo } from 'cow-react/modules/swap/helpers/tradeReceiveAmount'
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
        <span className={discount ? 'green' : ''}>
          <Trans>Fee</Trans>
          {hasFee && discount ? ` [-${discount}%]` : ''}
        </span>
        {hasFee ? (
          <span>
            {typeString}
            {feeAmount} {currency.symbol}
          </span>
        ) : (
          <strong className="green">
            <Trans>Free</Trans>
          </strong>
        )}
      </div>
      {allowsOffchainSigning && (
        <div>
          <span>
            <Trans>Gas cost</Trans>
          </span>
          <styledEl.GasCost>
            <Trans>Free</Trans>
          </styledEl.GasCost>
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
