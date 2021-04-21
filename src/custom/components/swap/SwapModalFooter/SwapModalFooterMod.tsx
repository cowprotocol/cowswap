import { CurrencyAmount, Percent, /* Trade, */ TradeType } from '@uniswap/sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from 'state/swap/actions'
import { TYPE } from 'theme'
import {
  computeSlippageAdjustedAmounts,
  //   computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity
} from 'utils/prices'
import { ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import FormattedPriceImpact from 'components/swap/FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from 'components/swap/styleds'
import { TradeWithFee } from 'state/swap/extension'
import { DEFAULT_PRECISION, SHORT_PRECISION } from 'constants/index'

export interface SwapModalFooterProps {
  trade: TradeWithFee
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
  fee: { feeTitle: string; feeTooltip: string; feeAmount?: CurrencyAmount | null }
  priceImpactWithoutFee?: Percent
}

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
  fee,
  priceImpactWithoutFee
}: SwapModalFooterProps) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { feeTitle, feeTooltip, feeAmount } = fee

  //   const { priceImpactWithoutFee , realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween align="center">
          <Text fontWeight={400} fontSize={14} color={theme.text2}>
            Price
          </Text>
          <Text
            fontWeight={500}
            fontSize={14}
            color={theme.text1}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px'
            }}
          >
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will expire if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(SHORT_PRECISION) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(SHORT_PRECISION) ?? '-'}
            </TYPE.black>
            <TYPE.black fontSize={14} marginLeft={'4px'}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black color={theme.text2} fontSize={14} fontWeight={400}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>
        <RowBetween>
          {/* <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Liquidity Provider Fee
            </TYPE.black>
            <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
          </RowFixed>
          <TYPE.black fontSize={14}>
            {realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}
          </TYPE.black> */}
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {feeTitle}
            </TYPE.black>
            <QuestionHelper text={feeTooltip} />
          </RowFixed>
          <TYPE.black fontSize={14}>
            {feeAmount ? feeAmount.toSignificant(DEFAULT_PRECISION) + ' ' + feeAmount.currency.symbol : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > 2}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
