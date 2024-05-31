import React, { ReactNode } from 'react'

import { HelpTooltip, renderTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import { getDirectedReceiveAmounts, ReceiveAmountInfo } from 'modules/trade'
import { LabelTooltipItems } from 'modules/twap'

import * as styledEl from './styled'

import { PartsState } from '../../state/partsStateAtom'

interface TradeAmountPreviewProps {
  amount: Nullish<CurrencyAmount<Currency>>
  fiatAmount: Nullish<CurrencyAmount<Currency>>
  label: JSX.Element
  tooltip: ReactNode
  children?: ReactNode
}

function TradeAmountPreview(props: TradeAmountPreviewProps) {
  const { amount, fiatAmount, label, tooltip, children } = props

  return (
    <styledEl.Part>
      <styledEl.Label>
        <Trans>{label}</Trans>
        <HelpTooltip text={tooltip} />
      </styledEl.Label>

      <styledEl.Amount amount={amount} tokenSymbol={amount?.currency} />
      <styledEl.Fiat amount={fiatAmount} />
      {children}
    </styledEl.Part>
  )
}

interface AmountPartsProps {
  partsState: PartsState
  labels: LabelTooltipItems
  receiveAmountInfo: ReceiveAmountInfo | null
}

export function AmountParts({ partsState, labels, receiveAmountInfo }: AmountPartsProps) {
  const { numberOfPartsValue, inputPartAmount, outputPartAmount, inputFiatAmount, outputFiatAmount } = partsState
  const { sellAmount, buyAmount } = labels

  const receiveAmounts = receiveAmountInfo && getDirectedReceiveAmounts(receiveAmountInfo)

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
      >
        {/*TODO: add styles*/}
        <div>
          <styledEl.Label>
            <Trans>Receive (incl. costs)</Trans>
          </styledEl.Label>
          <styledEl.Amount
            amount={receiveAmounts?.amountAfterFees}
            tokenSymbol={receiveAmounts?.amountAfterFees?.currency}
          />
        </div>
      </TradeAmountPreview>
    </styledEl.Wrapper>
  )
}
