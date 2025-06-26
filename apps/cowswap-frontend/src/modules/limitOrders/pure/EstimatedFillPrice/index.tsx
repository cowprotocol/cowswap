import { Nullish } from '@cowprotocol/types'
import { TokenAmount, HoverTooltip } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'
import { Currency, Price, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { ExecutionPriceTooltip } from '../ExecutionPriceTooltip'

const EstimatedFillPriceBox = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 0 0 16px 16px;
  font-size: 14px;
  font-weight: 600;
  background: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
`

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
`

const Value = styled.div`
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
`

export interface EstimatedFillPriceProps {
  currency: Currency
  estimatedFillPrice: Nullish<Fraction>
  executionPrice: Price<Currency, Currency>
  isInverted: boolean
  feeAmount: CurrencyAmount<Currency> | null
  marketRate: Fraction | null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function EstimatedFillPrice({
  currency,
  estimatedFillPrice,
  executionPrice,
  isInverted,
  feeAmount,
  marketRate,
}: EstimatedFillPriceProps) {
  return (
    <EstimatedFillPriceBox>
      <Label>
        Estimated fill price
        <QuestionWrapper>
          <HoverTooltip
            content={
              <ExecutionPriceTooltip
                isInverted={isInverted}
                feeAmount={feeAmount}
                marketRate={marketRate}
                displayedRate={estimatedFillPrice?.toString() || ''}
                executionPrice={executionPrice}
              />
            }
          >
            <span>❔</span>
          </HoverTooltip>
        </QuestionWrapper>
      </Label>
      <Value>
        ≈ <TokenAmount amount={estimatedFillPrice} tokenSymbol={currency} />
      </Value>
    </EstimatedFillPriceBox>
  )
}
