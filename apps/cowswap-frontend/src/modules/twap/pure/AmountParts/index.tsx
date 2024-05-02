import React, { ReactNode } from 'react'

import { HelpTooltip, renderTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import { LabelTooltipItems } from 'modules/twap'

import * as styledEl from './styled'

import { PartsState } from '../../state/partsStateAtom'

interface TradeAmountPreviewProps {
  amount: Nullish<CurrencyAmount<Currency>>
  fiatAmount: Nullish<CurrencyAmount<Currency>>
  label: JSX.Element
  tooltip: ReactNode
}

function TradeAmountPreview(props: TradeAmountPreviewProps) {
  const { amount, fiatAmount, label, tooltip } = props

  return (
    <styledEl.Part>
      <styledEl.Label>
        <Trans>{label}</Trans>
        <HelpTooltip text={tooltip} />
      </styledEl.Label>

      <styledEl.Amount amount={amount} tokenSymbol={amount?.currency} />
      <styledEl.Fiat amount={fiatAmount} />
    </styledEl.Part>
  )
}

export function AmountParts({ partsState, labels }: { partsState: PartsState; labels: LabelTooltipItems }) {
  const { numberOfPartsValue, inputPartAmount, outputPartAmount, inputFiatAmount, outputFiatAmount } = partsState
  const { sellAmount, buyAmount } = labels

  return (
    <styledEl.Wrapper>
      <TradeAmountPreview
        label={
          <>
            {labels.sellAmount.label} (1/{numberOfPartsValue})
          </>
        }
        tooltip={renderTooltip(sellAmount.tooltip)}
        amount={inputPartAmount}
        fiatAmount={inputFiatAmount}
      />

      <TradeAmountPreview
        label={
          <>
            {buyAmount.label} (1/{numberOfPartsValue})
          </>
        }
        tooltip={renderTooltip(buyAmount.tooltip)}
        amount={outputPartAmount}
        fiatAmount={outputFiatAmount}
      />
    </styledEl.Wrapper>
  )
}
