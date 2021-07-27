import React, { useMemo } from 'react'
import TradeGp from 'state/swap/TradeGp'
import QuestionHelper from 'components/QuestionHelper'
import styled from 'styled-components'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { formatSmart } from 'utils/format'
import useTheme from 'hooks/useTheme'

interface FeeInformationTooltipProps {
  trade?: TradeGp
  label: React.ReactNode
  showHelper: boolean
  amountBeforeFees?: string
  amountAfterFees?: string
  feeAmount?: string
  type: 'From' | 'To'
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

const FeeTooltipLine = styled.p`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin: 0;

  font-size: small;

  > .green {
    color: ${({ theme }) => theme.green1};
  }
`

const Breakline = styled.p`
  height: 0;
  width: 100%;
  margin: 6px 0;

  border-bottom-color: #9191912e;
  border-bottom: 1px;
  border-bottom-style: inset;
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

const FeeInnerWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  gap: 2px;
`

export default function FeeInformationTooltip(props: FeeInformationTooltipProps) {
  const { trade, label, amountBeforeFees, amountAfterFees, feeAmount, type, showHelper } = props

  const theme = useTheme()
  const fiatValue = useUSDCValue(type === 'From' ? trade?.inputAmount : trade?.outputAmount)

  const symbol = useMemo(() => trade?.[type === 'From' ? 'inputAmount' : 'outputAmount'].currency.symbol, [trade, type])

  if (!trade || !showHelper) return null

  return (
    <FeeInformationTooltipWrapper>
      <span>
        {label}{' '}
        <WrappedQuestionHelper
          bgColor={theme.bg4}
          color={theme.text1}
          text={
            <FeeInnerWrapper>
              <FeeTooltipLine>
                <span>Before fee</span>
                <span>
                  {amountBeforeFees} {symbol}
                </span>{' '}
              </FeeTooltipLine>
              <FeeTooltipLine>
                <span>Fee</span>
                <span>
                  {type === 'From' ? '+' : '-'}
                  {feeAmount} {symbol}
                </span>{' '}
              </FeeTooltipLine>
              <FeeTooltipLine>
                <span>Gas costs</span>
                <strong className="green">Free</strong>{' '}
              </FeeTooltipLine>
              <Breakline />
              <FeeTooltipLine>
                <strong>{type}</strong>
                <strong>
                  {amountAfterFees} {symbol}
                </strong>{' '}
              </FeeTooltipLine>
            </FeeInnerWrapper>
          }
        />
      </span>
      <FeeAmountAndFiat>
        {amountAfterFees} {fiatValue && <small>≈ ${formatSmart(fiatValue)}</small>}
      </FeeAmountAndFiat>
    </FeeInformationTooltipWrapper>
  )
}
