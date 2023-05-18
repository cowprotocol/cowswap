import { Trans } from '@lingui/macro'
import * as styledEl from './styled'
import QuestionHelper from 'components/QuestionHelper'
import { useNoOfParts, usePartsValues } from '../../hooks/useParts'
import { formatInputAmount } from '@cow/utils/amountFormat'

export function PartsDisplay() {
  const { numberOfPartsValue } = useNoOfParts()
  const { inputPartAmount, outputPartAmount, inputFiatAmount, outputFiatAmount } = usePartsValues()

  return (
    <styledEl.Wrapper>
      <styledEl.Part>
        <styledEl.Label>
          <Trans>Sell amount per part (1/{numberOfPartsValue})</Trans>
          <QuestionHelper text={<Trans>TODO: Add buy tooltip text</Trans>} />
        </styledEl.Label>

        <styledEl.Value>
          <div>{formatInputAmount(inputPartAmount) || '-'}</div>
          <div>{inputPartAmount?.currency.symbol}</div>
        </styledEl.Value>

        <styledEl.Fiat amount={inputFiatAmount} />
      </styledEl.Part>

      <styledEl.Part>
        <styledEl.Label>
          <Trans>Buy amount per part (1/{numberOfPartsValue})</Trans>
          <QuestionHelper text={<Trans>TODO: Add sell tooltip text</Trans>} />
        </styledEl.Label>

        <styledEl.Value>
          <div>{formatInputAmount(outputPartAmount) || '-'}</div>
          <div>{outputPartAmount?.currency.symbol}</div>
        </styledEl.Value>

        <styledEl.Fiat amount={outputFiatAmount} />
      </styledEl.Part>
    </styledEl.Wrapper>
  )
}
