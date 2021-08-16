// import { Trans } from '@lingui/macro'
import React, { useContext /*useMemo*/ } from 'react'
import { ThemeContext } from 'styled-components'
import { CurrencyAmount, Currency, TradeType } from '@uniswap/sdk-core'

// import { Field } from 'state/swap/actions'
import { TYPE } from 'theme'

import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed } from 'components/Row'
import TradeGp from 'state/swap/TradeGp'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { StyledInfo } from 'pages/Swap/SwapMod'
import { formatSmart } from 'utils/format'
import { RowReceivedAfterSlippage, RowSlippage, TradeSummaryProps } from '.'

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: TradeGp | null): {
  /*priceImpactWithoutFee: Percent | undefined;*/ realizedFee: CurrencyAmount<Currency> | undefined | null
} {
  // This is needed because we are using Uniswap pools for the price calculation,
  // thus, we need to account for the LP fees the same way as Uniswap does.
  // const { priceImpactWithoutFee } = computeTradePriceBreakdownUni(trade)

  return {
    // priceImpactWithoutFee,
    realizedFee:
      trade?.tradeType === TradeType.EXACT_INPUT
        ? trade?.outputAmountWithoutFee?.subtract(trade.outputAmount)
        : trade?.fee?.feeAsCurrency,
  }
}

export const FEE_TOOLTIP_MSG =
  'On CowSwap you sign your order (hence no gas costs!). The fees are covering your gas costs already.'

export default function TradeSummary({
  trade,
  allowedSlippage,
  showHelpers,
  showFee,
}: Omit<TradeSummaryProps, 'className'>) {
  const theme = useContext(ThemeContext)
  const { realizedFee } = React.useMemo(() => computeTradePriceBreakdown(trade), [trade])

  const fullRealizedFee = realizedFee?.toFixed(realizedFee?.currency.decimals) || '-'

  return (
    <AutoColumn gap="2px">
      {showFee && (
        <RowBetween height={24}>
          <RowFixed>
            <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
              Fees (incl. gas costs)
            </TYPE.black>
            {showHelpers && (
              <MouseoverTooltipContent content={FEE_TOOLTIP_MSG} bgColor={theme.bg1} color={theme.text1}>
                <StyledInfo />
              </MouseoverTooltipContent>
            )}
          </RowFixed>
          <TYPE.black
            textAlign="right"
            fontSize={12}
            color={theme.text1}
            title={`${fullRealizedFee} ${realizedFee?.currency.symbol}`}
          >
            {`${formatSmart(realizedFee) || '-'} ${realizedFee?.currency.symbol}`}
          </TYPE.black>
        </RowBetween>
      )}

      {/* Slippage */}
      <RowSlippage
        allowedSlippage={allowedSlippage}
        fontSize={12}
        fontWeight={400}
        rowHeight={24}
        showSettingOnClick={false}
      />

      {/* Min/Max received */}
      <RowReceivedAfterSlippage
        trade={trade}
        showHelpers={showHelpers}
        allowedSlippage={allowedSlippage}
        fontSize={12}
        fontWeight={400}
        rowHeight={24}
      />
    </AutoColumn>
  )
}
