import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReviewOrderModalAmountRow } from 'modules/trade/pure/ReviewOrderModalAmountRow'

import { PartsState } from '../../state/partsStateAtom'

export type TwapConfirmDetailsProps = {
  startTime: number | undefined
  partDuration: number | undefined
  partsState: PartsState
}

export function TwapConfirmDetails(_props: TwapConfirmDetailsProps) {
  const { startTime, partDuration, partsState } = _props
  const { numberOfPartsValue, inputPartAmount, inputFiatAmount, outputFiatAmount, outputPartAmount } = partsState

  const partsSuffix = ` part (1/${numberOfPartsValue})`
  const amountLabelSuffix = ' amount per' + partsSuffix

  return (
    <div>
      <span>TWAP order split in {numberOfPartsValue} equal parts</span>
      <ReviewOrderModalAmountRow
        amount={inputPartAmount}
        fiatAmount={inputFiatAmount}
        tooltip="TODO: add tooltip"
        label={'Sell' + amountLabelSuffix}
      />
      <ReviewOrderModalAmountRow
        amount={outputPartAmount}
        fiatAmount={outputFiatAmount}
        tooltip="TODO: add tooltip"
        label={'Buy' + amountLabelSuffix}
        isAmountAccurate={false}
      />
      {/*TODO: implement logic for time fields*/}
      <ConfirmDetailsItem tooltip="TODO: add tooltip" label={'Start time first' + partsSuffix} withArrow={false}>
        {startTime}
      </ConfirmDetailsItem>
      <ConfirmDetailsItem tooltip="TODO: add tooltip" label="Part duration" withArrow={false}>
        {partDuration}
      </ConfirmDetailsItem>
      <ConfirmDetailsItem tooltip="TODO: add tooltip" label="Total duration" withArrow={false}>
        {partDuration}
      </ConfirmDetailsItem>
    </div>
  )
}
