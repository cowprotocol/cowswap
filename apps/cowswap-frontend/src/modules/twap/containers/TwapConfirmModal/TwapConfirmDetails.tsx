import React from 'react'

import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { useReceiveAmountInfo } from 'modules/trade'
import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReviewOrderModalAmountRow } from 'modules/trade/pure/ReviewOrderModalAmountRow'
import { useUsdAmount } from 'modules/usdAmount'

import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 7px;
  padding: 0 6px 6px;
  font-size: 13px;

  > b {
    display: block;
    margin: 0 0 3px;

    ${Media.upToSmall()} {
      margin: 0 0 10px;
    }
  }
`

const TWAPSplitTitle = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 3px;

  ${Media.upToSmall()} {
    margin: 0 0 10px;
  }
`

export type TwapConfirmDetailsProps = {
  startTime: number | undefined
  numOfParts: number | undefined
  partDuration: number | undefined
  totalDuration: number | undefined
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export const TwapConfirmDetails = React.memo(function TwapConfirmDetails(props: TwapConfirmDetailsProps) {
  const { partDuration, totalDuration, numOfParts } = props

  const partsSuffix = ` part (1/${numOfParts})`
  const amountLabelSuffix = ' amount per' + partsSuffix

  const partDurationDisplay = partDuration ? deadlinePartsDisplay(partDuration, true) : ''
  const totalDurationDisplay = totalDuration ? deadlinePartsDisplay(totalDuration, true) : ''

  const receiveAmountInfo = useReceiveAmountInfo()
  const { sellAmount: inputPartAfterSlippageAmount, buyAmount: outputPartAfterSlippageAmount } =
    receiveAmountInfo?.afterSlippage || {}

  const inputPartAmountUsd = useUsdAmount(inputPartAfterSlippageAmount).value
  const outputPartAmountUsd = useUsdAmount(outputPartAfterSlippageAmount).value

  return (
    <Wrapper>
      <TWAPSplitTitle>
        TWAP order split in <b>{numOfParts} equal parts</b>
      </TWAPSplitTitle>

      {/* Sell amount per part */}
      <ReviewOrderModalAmountRow
        amount={inputPartAfterSlippageAmount}
        fiatAmount={inputPartAmountUsd}
        tooltip="This is the amount that will be sold in each part of the TWAP order."
        label={'Sell' + amountLabelSuffix}
        withTimelineDot={true}
      />

      {/* Buy amount per part */}
      <ReviewOrderModalAmountRow
        amount={outputPartAfterSlippageAmount}
        fiatAmount={outputPartAmountUsd}
        tooltip="This is the estimated amount you will receive for each part of the TWAP order."
        label={'Buy' + amountLabelSuffix}
        isAmountAccurate={false}
        withTimelineDot={true}
      />

      {/* Start time */}
      <ConfirmDetailsItem
        tooltip="The first part of your TWAP order will become active as soon as you confirm the order below."
        label={'Start time first' + partsSuffix}
        withArrow={false}
      >
        Now
      </ConfirmDetailsItem>

      {/* Part duration */}
      <ConfirmDetailsItem
        tooltip="The time each part of your TWAP order will remain active."
        label="Part duration"
        withArrow={false}
      >
        {partDurationDisplay}
      </ConfirmDetailsItem>

      {/* Total duration */}
      <ConfirmDetailsItem
        tooltip="The time before your total TWAP order ends."
        label="Total duration"
        withArrow={false}
      >
        {totalDurationDisplay}
      </ConfirmDetailsItem>
    </Wrapper>
  )
})
