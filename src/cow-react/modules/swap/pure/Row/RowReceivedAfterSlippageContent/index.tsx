import { Trans } from '@lingui/macro'
import { CurrencyAmount, Currency, TradeType } from '@uniswap/sdk-core'
import { StyledInfoIcon } from '@cow/modules/swap/pure/styled'
import { RowReceivedAfterSlippageProps } from '@cow/modules/swap/containers/Row/RowReceivedAfterSlippage'

import { RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'

import { getMinimumReceivedTooltip } from 'utils/tooltips'
import { formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { StyledRowBetween, TextWrapper } from '../styled'
import { RowStyleProps } from '@cow/modules/swap/pure/Row/types'

export interface RowReceivedAfterSlippageContentProps extends RowReceivedAfterSlippageProps {
  isExactIn: boolean
  fullOutAmount: string
  swapAmount: CurrencyAmount<Currency> | undefined
  symbol?: string
  styleProps?: RowStyleProps
}

export function RowReceivedAfterSlippageContent(props: RowReceivedAfterSlippageContentProps) {
  const { trade, showHelpers, allowedSlippage, isExactIn, fullOutAmount, swapAmount, symbol, styleProps = {} } = props
  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {trade.tradeType === TradeType.EXACT_INPUT ? (
            <Trans>Minimum received (incl. fee)</Trans>
          ) : (
            <Trans>Maximum sent (incl. fee)</Trans>
          )}
        </TextWrapper>
        {showHelpers && (
          <MouseoverTooltipContent content={getMinimumReceivedTooltip(allowedSlippage, isExactIn)} wrap>
            <StyledInfoIcon size={16} />
          </MouseoverTooltipContent>
        )}
      </RowFixed>

      <TextWrapper textAlign="right" title={`${fullOutAmount} ${symbol}`}>
        {`${formatSmart(swapAmount, AMOUNT_PRECISION) || '-'} ${symbol}`}
      </TextWrapper>
    </StyledRowBetween>
  )
}
