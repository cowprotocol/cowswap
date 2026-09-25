import { ReactNode } from 'react'

import { Currency, Percent, Price } from '@cowprotocol/currency'
import { HelpTooltip, renderTooltip } from '@cowprotocol/ui'

import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeWidgetFieldLabel } from 'modules/trade/pure/TradeWidgetField/styled'

import { TwapExecutionPrice } from 'common/pure/ExecutionPrice/TwapExecutionPrice.pure'

import * as styledEl from './TwapWorstAcceptedPriceInput.styled'

import { DEFAULT_TWAP_SLIPPAGE, MAX_TWAP_SLIPPAGE } from '../../const'

export interface TwapWorstAcceptedPriceInputProps {
  slippageLabel: ReactNode
  slippageTooltip: ReactNode
  twapOrderSlippage: Percent
  onSlippageInput: (slippage: number) => void
  executionPrice: Price<Currency, Currency> | null
  hideQuoteAmount: boolean
  isInverted: boolean
}

export function TwapWorstAcceptedPriceInput({
  slippageLabel,
  slippageTooltip,
  twapOrderSlippage,
  onSlippageInput,
  executionPrice,
  hideQuoteAmount,
  isInverted,
}: TwapWorstAcceptedPriceInputProps): ReactNode {
  return (
    <styledEl.Root>
      <TradeWidgetFieldLabel>
        {slippageLabel}
        <HelpTooltip text={renderTooltip(slippageTooltip)} />
      </TradeWidgetFieldLabel>

      <styledEl.Inputs>
        <styledEl.ExecutionPriceWrapper>
          {executionPrice && !hideQuoteAmount ? (
            <TwapExecutionPrice executionPrice={executionPrice} isInverted={isInverted} />
          ) : (
            '0'
          )}
        </styledEl.ExecutionPriceWrapper>

        <styledEl.SlippageInput>
          <TradeNumberInput
            value={+twapOrderSlippage.toFixed(2)}
            onUserInput={onSlippageInput}
            decimalsPlaces={2}
            placeholder={DEFAULT_TWAP_SLIPPAGE.toFixed(1)}
            min={0}
            label={null}
            max={MAX_TWAP_SLIPPAGE}
            showUpDownArrows={true}
            upDownArrowsLeftAlign={true}
            suffix="%"
            step={0.1}
          />
        </styledEl.SlippageInput>
      </styledEl.Inputs>
    </styledEl.Root>
  )
}
