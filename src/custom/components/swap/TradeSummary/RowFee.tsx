import { useContext, useMemo } from 'react'
import { CurrencyAmount, Currency, TradeType, Token } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components/macro'
import { TYPE } from 'theme'

import { formatMax, formatSmart } from 'utils/format'
import TradeGp from 'state/swap/TradeGp'
import { StyledInfo } from 'pages/Swap/styleds'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { AMOUNT_PRECISION, FIAT_PRECISION } from 'constants/index'
import { LightGreyText } from 'pages/Swap'
import { useShowQuoteLoader } from 'state/price/hooks'
import Shimmer from 'components/Shimmer'

export const GASLESS_FEE_TOOLTIP_MSG =
  'On CowSwap you sign your order (hence no gas costs!). The fees are covering your gas costs already.'

export const PRESIGN_FEE_TOOLTIP_MSG =
  'These fees cover the gas costs for executing the order once it has been placed. However - since you are using a smart contract wallet - you will need to pay the gas for signing an on-chain tx in order to place it.'

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: TradeGp | null): {
  realizedFee: CurrencyAmount<Currency> | undefined | null
} {
  // This is needed because we are using Uniswap pools for the price calculation,
  // thus, we need to account for the LP fees the same way as Uniswap does.
  // const { priceImpactWithoutFee } = computeTradePriceBreakdownUni(trade)

  return {
    realizedFee:
      trade?.tradeType === TradeType.EXACT_INPUT
        ? trade?.outputAmountWithoutFee?.subtract(trade.outputAmount)
        : trade?.fee?.feeAsCurrency,
  }
}

export interface RowFeeProps {
  // Although fee is part of the trade, if the trade is invalid, then it will be undefined
  // Even for invalid trades, we want to display the fee, this is why there's another "fee" parameter
  trade?: TradeGp
  fee?: CurrencyAmount<Currency>
  feeFiatValue: CurrencyAmount<Token> | null
  showHelpers: boolean
  allowsOffchainSigning: boolean
  fontWeight?: number
  fontSize?: number
  rowHeight?: number
}

export function RowFee({
  trade,
  fee,
  feeFiatValue,
  allowsOffchainSigning,
  showHelpers,
  fontSize = 14,
  fontWeight = 500,
  rowHeight,
}: RowFeeProps) {
  const theme = useContext(ThemeContext)
  const { realizedFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const displayFee = realizedFee || fee
  const feeCurrencySymbol = displayFee?.currency.symbol || '-'
  const showLoader = useShowQuoteLoader()
  // trades are null when there is a fee quote error e.g
  // so we can take both
  const { feeToken, feeUsd, fullDisplayFee } = useMemo(() => {
    const smartFeeFiatValue = formatSmart(feeFiatValue, FIAT_PRECISION)
    const smartFeeTokenValue = formatSmart(displayFee, AMOUNT_PRECISION)
    const feeToken = smartFeeTokenValue ? `${smartFeeTokenValue} ${feeCurrencySymbol}` : '🎉 Free!'
    const fullDisplayFee = formatMax(displayFee, displayFee?.currency.decimals) || '-'

    return {
      feeToken,
      feeUsd: smartFeeFiatValue && `(≈$${smartFeeFiatValue})`,
      fullDisplayFee,
    }
  }, [displayFee, feeCurrencySymbol, feeFiatValue])

  const includeGasMessage = allowsOffchainSigning ? ' (incl. gas costs)' : ''
  const tooltip = allowsOffchainSigning ? GASLESS_FEE_TOOLTIP_MSG : PRESIGN_FEE_TOOLTIP_MSG

  return (
    <RowBetween height={rowHeight}>
      <RowFixed>
        <TYPE.black fontSize={fontSize} fontWeight={fontWeight} color={theme.text2}>
          Fees {includeGasMessage}
        </TYPE.black>
        {showHelpers && (
          <MouseoverTooltipContent content={tooltip} bgColor={theme.bg1} color={theme.text1}>
            <StyledInfo />
          </MouseoverTooltipContent>
        )}
      </RowFixed>

      {showLoader ? (
        <Shimmer height={10} width={110} />
      ) : (
        <TYPE.black fontSize={fontSize} color={theme.text1} title={`${fullDisplayFee} ${feeCurrencySymbol}`}>
          {feeToken} {feeUsd && <LightGreyText>{feeUsd}</LightGreyText>}
        </TYPE.black>
      )}
    </RowBetween>
  )
}
