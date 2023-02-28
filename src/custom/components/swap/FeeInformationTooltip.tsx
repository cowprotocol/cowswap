import React, { useMemo } from 'react'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import QuestionHelper from 'components/QuestionHelper'
import styled from 'styled-components/macro'
import useTheme from 'hooks/useTheme'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'
import { FiatAmount } from '@cow/common/pure/FiatAmount'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { formatTokenAmount } from '@cow/utils/amountFormat'

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

const FeeTooltipLine = styled.p`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  gap: 0 8px;

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

const MAX_TOKEN_SYMBOL_LENGTH = 6

type FeeBreakdownProps = FeeInformationTooltipProps & {
  symbol: string | undefined
  // TODO: Re-enable modal once subsidy is back
  // discount: number
}
const FeeBreakdownLine = ({ feeAmount, type, symbol }: FeeBreakdownProps) => {
  const typeString = type === 'From' ? '+' : '-'

  const smartFee = formatTokenAmount(feeAmount)

  return (
    <FeeTooltipLine>
      {/* TODO: Re-enable modal once subsidy is back  */}
      {/* <span className={discount ? 'green' : ''}>Fee{smartFee && discount ? ` [-${discount}%]` : ''}</span> */}
      {smartFee ? (
        <span>
          {typeString}
          <TokenAmount amount={feeAmount} tokenSymbol={{ symbol }} />
        </span>
      ) : (
        <strong className="green">Free</strong>
      )}
    </FeeTooltipLine>
  )
}

// TODO: this looks duplicated by <ReceiveAmountInfoTooltip />. Consider replacing it with that to avoid duplication

export default function FeeInformationTooltip(props: FeeInformationTooltipProps) {
  const {
    trade,
    label,
    amountBeforeFees,
    amountAfterFees,
    type,
    showHelper,
    fiatValue,
    showFiat = false,
    allowsOffchainSigning,
  } = props

  const theme = useTheme()
  const isEthFlow = useIsEthFlow()

  // const { subsidy } = useCowBalanceAndSubsidy()

  const symbol = useMemo(() => {
    const amount = trade?.[type === 'From' ? 'inputAmount' : 'outputAmount']
    return amount?.currency.symbol
  }, [trade, type])

  if (!trade || !showHelper) return null

  return (
    <FeeInformationTooltipWrapper>
      <span>
        {label}{' '}
        <WrappedQuestionHelper
          bgColor={theme.grey1}
          color={theme.text1}
          text={
            <FeeInnerWrapper>
              <FeeTooltipLine>
                <span>Before fee</span>
                <span>
                  {amountBeforeFees} <TokenSymbol token={{ symbol }} length={MAX_TOKEN_SYMBOL_LENGTH} />
                </span>{' '}
              </FeeTooltipLine>
              <FeeBreakdownLine {...props} /*discount={subsidy.discount}*/ symbol={symbol} />
              {allowsOffchainSigning && !isEthFlow && (
                <FeeTooltipLine>
                  <span>Gas costs</span>
                  <strong className="green">Free</strong>
                </FeeTooltipLine>
              )}
              <Breakline />
              <FeeTooltipLine>
                <strong>{type}</strong>
                <strong>
                  {amountAfterFees} <TokenSymbol token={{ symbol }} length={MAX_TOKEN_SYMBOL_LENGTH} />
                </strong>{' '}
              </FeeTooltipLine>
            </FeeInnerWrapper>
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
