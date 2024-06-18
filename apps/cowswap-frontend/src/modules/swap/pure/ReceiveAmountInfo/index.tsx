import React from 'react'

import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { ReceiveAmountInfo } from 'modules/trade/types'

import * as styledEl from './styled'

export interface ReceiveAmountInfoTooltipProps {
  receiveAmountInfo: ReceiveAmountInfo
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

export function ReceiveAmountInfoTooltip(props: ReceiveAmountInfoTooltipProps) {
  const isEoaEthFlow = useIsEoaEthFlow()

  const { receiveAmountInfo, subsidyAndBalance, allowsOffchainSigning } = props
  const { type, amountAfterFees, amountBeforeFees, feeAmount, partnerFeeAmount } = receiveAmountInfo
  const { subsidy } = subsidyAndBalance
  const { discount } = subsidy

  const typeString = type === 'from' ? '+' : '-'
  const hasPartnerFee = !!partnerFeeAmount && partnerFeeAmount.greaterThan(0)
  const hasNetworkFee = !!feeAmount && feeAmount.greaterThan(0)
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
      {feeAmount && (
        <div>
          {discount ? <styledEl.GreenText>{FeePercent}</styledEl.GreenText> : FeePercent}
          {hasFee ? (
            <span>
              {typeString}
              <TokenAmount amount={feeAmount} tokenSymbol={feeAmount?.currency} defaultValue="0" />
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
            <Trans>{type === 'from' ? 'From' : 'To'}</Trans>
          </span>
          <span>
            <TokenAmount amount={amountAfterFees} tokenSymbol={amountAfterFees.currency} defaultValue="0" />
          </span>
        </styledEl.TotalAmount>
      )}
    </styledEl.Box>
  )
}
