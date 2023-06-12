import React from 'react'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReviewOrderModalAmountRow } from 'modules/trade/pure/ReviewOrderModalAmountRow'

import { PartsState } from '../../state/partsStateAtom'

export type TwapConfirmDetailsProps = {
  startTime: number | undefined
  partDuration: string
  totalDuration: string
  partsState: PartsState
}

export const TwapConfirmDetails = React.memo(function TwapConfirmDetails(props: TwapConfirmDetailsProps) {
  const { partDuration, totalDuration, partsState } = props
  const { numberOfPartsValue, inputPartAmount, inputFiatAmount, outputFiatAmount, outputPartAmount } = partsState

  const partsSuffix = ` part (1/${numberOfPartsValue})`
  const amountLabelSuffix = ' amount per' + partsSuffix

  return (
    <div>
      <span>TWAP order split in {numberOfPartsValue} equal parts</span>

      {/* Sell amount per part */}
      <ReviewOrderModalAmountRow
        amount={inputPartAmount}
        fiatAmount={inputFiatAmount}
        tooltip="TODO: add tooltip"
        label={'Sell' + amountLabelSuffix}
      />

      {/* Buy amount per part */}
      <ReviewOrderModalAmountRow
        amount={outputPartAmount}
        fiatAmount={outputFiatAmount}
        tooltip="TODO: add tooltip"
        label={'Buy' + amountLabelSuffix}
        isAmountAccurate={false}
      />

      {/* Start time */}
      {/*<ConfirmDetailsItem tooltip="TODO: add tooltip" label={'Start time first' + partsSuffix} withArrow={false}>*/}
      {/*  {startTime}*/}
      {/*</ConfirmDetailsItem>*/}

      {/* Part duration */}
      <ConfirmDetailsItem tooltip="TODO: add tooltip" label="Part duration" withArrow={false}>
        {partDuration}
      </ConfirmDetailsItem>

      {/* Total duration */}
      <ConfirmDetailsItem tooltip="TODO: add tooltip" label="Total duration" withArrow={false}>
        {totalDuration}
      </ConfirmDetailsItem>
    </div>
  )
})
