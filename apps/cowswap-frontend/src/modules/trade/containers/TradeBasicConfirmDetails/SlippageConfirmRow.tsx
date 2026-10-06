import { ReactNode } from 'react'

import { Currency, Percent, Price } from '@cowprotocol/currency'
import { PercentDisplay } from '@cowprotocol/ui'

import { Nullish } from 'types'

import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { RateWrapper } from 'common/pure/RateInfo'

import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'

export interface SlippageConfirmRowProps {
  slippage: Percent
  price: Nullish<Price<Currency, Currency>>
  isInverted: boolean
  onToggleInverted: () => void
  withTimelineDot: boolean
  tooltip: ReactNode
  label: ReactNode
}

export function SlippageConfirmRow({
  slippage,
  price,
  isInverted,
  onToggleInverted,
  withTimelineDot,
  tooltip,
  label,
}: SlippageConfirmRowProps): ReactNode {
  const percent = <PercentDisplay percent={slippage.toFixed(2)} />
  const row = (
    <ReviewOrderModalAmountRow withTimelineDot={withTimelineDot} tooltip={tooltip} label={label}>
      {price ? (
        <>
          <ExecutionPrice
            executionPrice={price}
            isInverted={isInverted}
            hideFiat
            showBaseCurrency
            separatorSymbol="="
          />
          <i>&nbsp;({percent})</i>
        </>
      ) : (
        percent
      )}
    </ReviewOrderModalAmountRow>
  )

  if (!price) {
    return row
  }

  return <RateWrapper onClick={onToggleInverted}>{row}</RateWrapper>
}
