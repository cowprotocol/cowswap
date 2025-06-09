import React from 'react'

import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'

import { getOrderTypeReceiveAmounts, useIsEoaEthFlow } from 'modules/trade'
import { ReceiveAmountInfo } from 'modules/trade/types'

import * as styledEl from './styled'

export interface ReceiveAmountInfoTooltipProps {
  receiveAmountInfo: ReceiveAmountInfo
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function ReceiveAmountInfoTooltip(props: ReceiveAmountInfoTooltipProps) {
  const isEoaEthFlow = useIsEoaEthFlow()

  const { receiveAmountInfo, subsidyAndBalance, allowsOffchainSigning } = props
  const {
    isSell,
    costs: {
      partnerFee: { amount: partnerFeeAmount },
    },
  } = receiveAmountInfo
  const { amountAfterFees, amountBeforeFees, networkFeeAmount } = getOrderTypeReceiveAmounts(receiveAmountInfo)
  const { subsidy } = subsidyAndBalance
  const { discount } = subsidy

  const typeString = !isSell ? '+' : '-'
  const hasPartnerFee = !!partnerFeeAmount && partnerFeeAmount.greaterThan(0)
  const hasNetworkFee = !!networkFeeAmount && networkFeeAmount.greaterThan(0)
  const hasFee = hasNetworkFee || hasPartnerFee

  const isEoaNotEthFlow = allowsOffchainSigning && !isEoaEthFlow

  const FeePercent = (
    <span>
      <Trans>Network costs</Trans>
      {hasNetworkFee && discount ? ` [-${discount}%]` : ''}
    </span>
  )

  return (
    <styledEl.Box>
      <div>
        <span>
          <Trans>Before costs</Trans>
        </span>
        <span>
          <TokenAmount amount={amountBeforeFees} tokenSymbol={amountBeforeFees?.currency} defaultValue="0" />
        </span>
      </div>
      {networkFeeAmount && (
        <div>
          {discount ? <styledEl.GreenText>{FeePercent}</styledEl.GreenText> : FeePercent}
          {hasFee ? (
            <span>
              {typeString}
              <TokenAmount amount={networkFeeAmount} tokenSymbol={networkFeeAmount?.currency} defaultValue="0" />
            </span>
          ) : (
            <styledEl.GreenText>
              <strong>
                <Trans>Free</Trans>
              </strong>
            </styledEl.GreenText>
          )}
        </div>
      )}
      {(isEoaNotEthFlow || hasPartnerFee) && (
        <div>
          <span>
            <Trans>Fee</Trans>
          </span>
          {hasPartnerFee ? (
            <span>
              {typeString}
              <TokenAmount amount={partnerFeeAmount} tokenSymbol={partnerFeeAmount?.currency} defaultValue="0" />
            </span>
          ) : (
            <styledEl.GreenText>
              <strong>
                <Trans>Free</Trans>
              </strong>
            </styledEl.GreenText>
          )}
        </div>
      )}
      {amountAfterFees.greaterThan(0) && (
        <styledEl.TotalAmount>
          <span>
            <Trans>{!isSell ? 'From' : 'To'}</Trans>
          </span>
          <span>
            <TokenAmount amount={amountAfterFees} tokenSymbol={amountAfterFees.currency} defaultValue="0" />
          </span>
        </styledEl.TotalAmount>
      )}
    </styledEl.Box>
  )
}
