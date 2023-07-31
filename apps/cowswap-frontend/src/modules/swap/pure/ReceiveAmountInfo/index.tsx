import React from 'react'

import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'

import { ReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'

import { TokenSymbol } from 'common/pure/TokenSymbol'

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
  const { type, amountAfterFees, amountBeforeFees, feeAmount, feeAmountRaw } = receiveAmountInfo
  const { subsidy } = subsidyAndBalance
  const { discount } = subsidy

  const typeString = type === 'from' ? '+' : '-'
  const hasFee = feeAmountRaw && feeAmountRaw.greaterThan(0)

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
      {allowsOffchainSigning && !isEoaEthFlow && (
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
          {amountAfterFees} {<TokenSymbol token={currency} length={MAX_TOKEN_SYMBOL_LENGTH} />}
        </span>
      </styledEl.TotalAmount>
    </styledEl.Box>
  )
}
