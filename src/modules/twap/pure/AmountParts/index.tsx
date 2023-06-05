import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import QuestionHelper from 'legacy/components/QuestionHelper'

import { LabelTooltipItems } from 'modules/twap'

import * as styledEl from './styled'

import { PartsState } from '../../state/partsStateAtom'

interface TradeAmountPreviewProps {
  amount: Nullish<CurrencyAmount<Currency>>
  fiatAmount: Nullish<CurrencyAmount<Currency>>
  label: JSX.Element
  tooltip: JSX.Element
}

function TradeAmountPreview(props: TradeAmountPreviewProps) {
  const { amount, fiatAmount, label, tooltip } = props

  return (
    <styledEl.Part>
      <styledEl.Label>
        <Trans>{label}</Trans>
        <QuestionHelper text={tooltip} />
      </styledEl.Label>

      <styledEl.Amount amount={amount} tokenSymbol={amount?.currency} />
      <styledEl.Fiat amount={fiatAmount} />
    </styledEl.Part>
  )
}

export function AmountParts({ partsState, labels }: { partsState: PartsState, labels: LabelTooltipItems }) {
  const { numberOfPartsValue, inputPartAmount, outputPartAmount, inputFiatAmount, outputFiatAmount } = partsState
  const { sellAmount, buyAmount } = labels

  return (
    <styledEl.Wrapper>
      <TradeAmountPreview
        label={<Trans>{labels.sellAmount.label} (1/{numberOfPartsValue})</Trans>}
        tooltip={<Trans>{sellAmount.tooltip}</Trans>}
        amount={inputPartAmount}
        fiatAmount={inputFiatAmount}
      />

      <TradeAmountPreview
        label={<Trans>{buyAmount.label} (1/{numberOfPartsValue})</Trans>}
        tooltip={<Trans>{buyAmount.tooltip}</Trans>}
        amount={outputPartAmount}
        fiatAmount={outputFiatAmount}
      />
    </styledEl.Wrapper>
  )
}
