import React from 'react'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import QuestionHelper from 'components/QuestionHelper'
import styled from 'styled-components/macro'
import useTheme from 'hooks/useTheme'
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { FiatAmount } from '@cow/common/pure/FiatAmount'
import { ReceiveAmountInfoTooltip } from '@cow/modules/swap/pure/ReceiveAmountInfo'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from '@cow/modules/swap/helpers/tradeReceiveAmount'

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

export default function FeeInformationTooltip(props: FeeInformationTooltipProps) {
  const { trade, label, amountAfterFees, type, showHelper, fiatValue, showFiat = false, allowsOffchainSigning } = props

  const theme = useTheme()

  const subsidyAndBalance = useCowBalanceAndSubsidy()

  if (!trade || !showHelper) return null

  const receiveAmountInfo = type === 'To' ? getOutputReceiveAmountInfo(trade) : getInputReceiveAmountInfo(trade)
  const currency = type === 'To' ? trade.outputAmount.currency : trade.inputAmount.currency

  return (
    <FeeInformationTooltipWrapper>
      <span>
        {label}{' '}
        <WrappedQuestionHelper
          bgColor={theme.grey1}
          color={theme.text1}
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
