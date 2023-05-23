import React from 'react'
import * as styledEl from './styled'
import { ReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'
import { Currency } from '@uniswap/sdk-core'
import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'
import { Trans } from '@lingui/macro'
import { TokenSymbol } from 'common/pure/TokenSymbol'
import { useIsEthFlow } from 'modules/swap/hooks/useIsEthFlow'

export interface ReceiveAmountInfoTooltipProps {
  receiveAmountInfo: ReceiveAmountInfo
  currency: Currency
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

const MAX_TOKEN_SYMBOL_LENGTH = 6

export function ReceiveAmountInfoTooltip(props: ReceiveAmountInfoTooltipProps) {
  const isEthFlow = useIsEthFlow()

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
          {amountAfterFees} {<TokenSymbol token={currency} length={MAX_TOKEN_SYMBOL_LENGTH} />}
        </span>
      </styledEl.TotalAmount>
    </styledEl.Box>
  )
}
