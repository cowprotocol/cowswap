import { Trans } from '@lingui/macro'
import { CurrencyAmount, Currency, TradeType } from '@uniswap/sdk-core'
import { ThemedText } from 'theme'
import { StyledInfo } from '@cow/pages/Swap/styleds'
import { RowReceivedAfterSlippageProps } from '@cow/modules/swap/containers/RowReceivedAfterSlippage'

import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'

import { getMinimumReceivedTooltip } from 'utils/tooltips'
import { formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'

export type RowReceivedAfterSlippageAuxProps = {
  isExactIn: boolean
  fullOutAmount: string
  swapAmount: CurrencyAmount<Currency> | undefined
  symbol?: string
}

export function RowReceivedAfterSlippageContent(
  props: RowReceivedAfterSlippageProps & RowReceivedAfterSlippageAuxProps
) {
  const {
    rowHeight,
    fontSize,
    fontWeight,
    trade,
    showHelpers,
    theme,
    allowedSlippage,
    isExactIn,
    fullOutAmount,
    swapAmount,
    symbol,
  } = props
  return (
    <RowBetween height={rowHeight}>
      <RowFixed>
        <ThemedText.Black fontSize={fontSize} fontWeight={fontWeight} color={theme.text1}>
          {trade.tradeType === TradeType.EXACT_INPUT ? (
            <Trans>Minimum received (incl. fee)</Trans>
          ) : (
            <Trans>Maximum sent (incl. fee)</Trans>
          )}
        </ThemedText.Black>
        {showHelpers && (
          <MouseoverTooltipContent
            content={getMinimumReceivedTooltip(allowedSlippage, isExactIn)}
            bgColor={theme.bg1}
            color={theme.text1}
            wrap
          >
            <StyledInfo />
          </MouseoverTooltipContent>
        )}
      </RowFixed>

      <ThemedText.Black textAlign="right" fontSize={fontSize} color={theme.text1} title={`${fullOutAmount} ${symbol}`}>
        {`${formatSmart(swapAmount, AMOUNT_PRECISION) || '-'} ${symbol}`}
      </ThemedText.Black>
    </RowBetween>
  )
}
