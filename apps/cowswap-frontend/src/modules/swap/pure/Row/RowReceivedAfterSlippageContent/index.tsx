import { CurrencyAmount, Currency, TradeType } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { RowFixed } from 'legacy/components/Row'
import { MouseoverTooltipContent } from 'legacy/components/Tooltip'
import { getMinimumReceivedTooltip } from 'legacy/utils/tooltips'

import { RowReceivedAfterSlippageProps } from 'modules/swap/containers/Row/RowReceivedAfterSlippage'
import { RowStyleProps } from 'modules/swap/pure/Row/types'
import { StyledInfoIcon } from 'modules/swap/pure/styled'

import { TokenAmount } from 'common/pure/TokenAmount'

import { StyledRowBetween, TextWrapper } from '../styled'

export interface RowReceivedAfterSlippageContentProps extends RowReceivedAfterSlippageProps {
  isExactIn: boolean
  swapAmount: CurrencyAmount<Currency> | undefined
  styleProps?: RowStyleProps
}

export function RowReceivedAfterSlippageContent(props: RowReceivedAfterSlippageContentProps) {
  const { trade, showHelpers, allowedSlippage, isExactIn, swapAmount, styleProps = {} } = props
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

      <TextWrapper textAlign="right">
        <TokenAmount amount={swapAmount} defaultValue="-" tokenSymbol={swapAmount?.currency} />
      </TextWrapper>
    </StyledRowBetween>
  )
}
