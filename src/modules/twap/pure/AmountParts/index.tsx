import { Trans } from '@lingui/macro'
import * as styledEl from './styled'
import QuestionHelper from 'legacy/components/QuestionHelper'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { Nullish } from 'types'
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

export function AmountParts({ partsState }: { partsState: PartsState }) {
  const { numberOfPartsValue, inputPartAmount, outputPartAmount, inputFiatAmount, outputFiatAmount } = partsState

  return (
    <styledEl.Wrapper>
      <TradeAmountPreview
        label={<Trans>Sell amount per part (1/{numberOfPartsValue})</Trans>}
        tooltip={<Trans>TODO: Add buy tooltip text</Trans>}
        amount={inputPartAmount}
        fiatAmount={inputFiatAmount}
      />

      <TradeAmountPreview
        label={<Trans>Buy amount per part (1/{numberOfPartsValue})</Trans>}
        tooltip={<Trans>TODO: Add sell tooltip text</Trans>}
        amount={outputPartAmount}
        fiatAmount={outputFiatAmount}
      />
    </styledEl.Wrapper>
  )
}
