import React from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'

import { ReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'

import * as styledEl from './styled'

export interface ReceiveAmountInfoTooltipProps {
  receiveAmountInfo: ReceiveAmountInfo
  currency: Currency
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

const MAX_TOKEN_SYMBOL_LENGTH = 6

export function ReceiveAmountInfoTooltip(props: ReceiveAmountInfoTooltipProps) {
  const isEoaEthFlow = useIsEoaEthFlow()

  const { receiveAmountInfo, currency, subsidyAndBalance, allowsOffchainSigning } = props
  const {
    type,
    amountAfterFees,
    amountAfterFeesRaw,
    amountBeforeFees,
    feeAmount,
    feeAmountRaw,
    partnerFeeAmount,
    partnerFeeAmountRaw,
  } = receiveAmountInfo
  const { subsidy } = subsidyAndBalance
  const { discount } = subsidy

  const typeString = type === 'from' ? '+' : '-'
  const hasPartnerFee = !!partnerFeeAmountRaw && partnerFeeAmountRaw.greaterThan(0)
  const hasNetworkFee = !!feeAmountRaw && feeAmountRaw.greaterThan(0)
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
          {amountBeforeFees} {<TokenSymbol token={currency} length={MAX_TOKEN_SYMBOL_LENGTH} />}
        </span>
      </div>
      <div>
        {discount ? <styledEl.GreenText>{FeePercent}</styledEl.GreenText> : FeePercent}
        {hasFee ? (
          <span>
            {typeString}
            {feeAmount} {<TokenSymbol token={currency} length={MAX_TOKEN_SYMBOL_LENGTH} />}
          </span>
        ) : (
          <styledEl.GreenText>
            <strong>
              <Trans>Free</Trans>
            </strong>
          </styledEl.GreenText>
        )}
      </div>
      {(isEoaNotEthFlow || hasPartnerFee) && (
        <div>
          <span>
            <Trans>Fee</Trans>
          </span>
          {hasPartnerFee ? (
            <span>
              {typeString}
              {partnerFeeAmount} {<TokenSymbol token={currency} length={MAX_TOKEN_SYMBOL_LENGTH} />}
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
      {amountAfterFeesRaw.greaterThan(0) && (
        <styledEl.TotalAmount>
          <span>
            <Trans>{type === 'from' ? 'From' : 'To'}</Trans>
          </span>
          <span>
            {amountAfterFees} {<TokenSymbol token={currency} length={MAX_TOKEN_SYMBOL_LENGTH} />}
          </span>
        </styledEl.TotalAmount>
      )}
    </styledEl.Box>
  )
}
