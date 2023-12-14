import React from 'react'

import { FiatAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import QuestionHelper from 'legacy/components/QuestionHelper'
import useCowBalanceAndSubsidy from 'legacy/hooks/useCowBalanceAndSubsidy'
import TradeGp from 'legacy/state/swap/TradeGp'

import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'
import { ReceiveAmountInfoTooltip } from 'modules/swap/pure/ReceiveAmountInfo'

interface FeeInformationTooltipProps {
  trade?: TradeGp
  label: React.ReactNode
  showHelper: boolean
  amountBeforeFees?: React.ReactNode
  amountAfterFees?: React.ReactNode
  feeAmount?: CurrencyAmount<Currency>
  type: 'From' | 'To'
  fiatValue: CurrencyAmount<Token> | null
  showFiat?: boolean
  allowsOffchainSigning: boolean
}

const WrappedQuestionHelper = styled(QuestionHelper)`
  display: inline-flex;
`

export const FeeInformationTooltipWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
`

const FeeAmountAndFiat = styled.span`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: flex-end;
  justify-content: center;
  gap: 5px;

  font-weight: 600;

  > small {
    font-size: 75%;
    font-weight: normal;
  }
`

export function FeeInformationTooltip(props: FeeInformationTooltipProps) {
  const { trade, label, amountAfterFees, type, showHelper, fiatValue, showFiat = false, allowsOffchainSigning } = props

  const subsidyAndBalance = useCowBalanceAndSubsidy()

  if (!trade || !showHelper) return null

  const receiveAmountInfo = type === 'To' ? getOutputReceiveAmountInfo(trade) : getInputReceiveAmountInfo(trade)
  const currency = type === 'To' ? trade.outputAmount.currency : trade.inputAmount.currency

  return (
    <FeeInformationTooltipWrapper>
      <span>
        {label}{' '}
        <WrappedQuestionHelper
          text={
            <ReceiveAmountInfoTooltip
              receiveAmountInfo={receiveAmountInfo}
              allowsOffchainSigning={allowsOffchainSigning}
              currency={currency}
              subsidyAndBalance={subsidyAndBalance}
            />
          }
        />
      </span>
      <FeeAmountAndFiat>
        {amountAfterFees}{' '}
        {showFiat && fiatValue && (
          <small>
            <FiatAmount amount={fiatValue} />
          </small>
        )}
      </FeeAmountAndFiat>
    </FeeInformationTooltipWrapper>
  )
}
