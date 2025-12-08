import React from 'react'

import { Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useGetReceiveAmountInfo } from 'modules/trade'
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

export const TwapConfirmDetails = React.memo(function TwapConfirmDetails(props: TwapConfirmDetailsProps) {
  const { partDuration, totalDuration, numOfParts } = props

  const partsSuffix = ' ' + t`part` + ` (1/'${numOfParts})`
  const amountLabelSuffix = ' ' + t`amount per` + partsSuffix

  const partDurationDisplay = partDuration ? deadlinePartsDisplay(partDuration, true) : ''
  const totalDurationDisplay = totalDuration ? deadlinePartsDisplay(totalDuration, true) : ''

  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { sellAmount: inputPartAfterSlippageAmount, buyAmount: outputPartAfterSlippageAmount } =
    receiveAmountInfo?.afterSlippage || {}

  const inputPartAmountUsd = useUsdAmount(inputPartAfterSlippageAmount).value
  const outputPartAmountUsd = useUsdAmount(outputPartAfterSlippageAmount).value

  return (
    <Wrapper>
      <TWAPSplitTitle>
        <Trans>
          TWAP order split in <b>{numOfParts} equal parts</b>
        </Trans>
      </TWAPSplitTitle>

      {/* Sell amount per part */}
      <ReviewOrderModalAmountRow
        amount={inputPartAfterSlippageAmount}
        fiatAmount={inputPartAmountUsd}
        tooltip={t`This is the amount that will be sold in each part of the TWAP order.`}
        label={t`Sell` + amountLabelSuffix}
        withTimelineDot={true}
      />

      {/* Buy amount per part */}
      <ReviewOrderModalAmountRow
        amount={outputPartAfterSlippageAmount}
        fiatAmount={outputPartAmountUsd}
        tooltip={t`This is the estimated amount you will receive for each part of the TWAP order.`}
        label={t`Buy` + amountLabelSuffix}
        isAmountAccurate={false}
        withTimelineDot={true}
      />

      {/* Start time */}
      <ConfirmDetailsItem
        tooltip={t`The first part of your TWAP order will become active as soon as you confirm the order below.`}
        label={t`Start time first` + partsSuffix}
        withArrow={false}
      >
        <Trans>Now</Trans>
      </ConfirmDetailsItem>

      {/* Part duration */}
      <ConfirmDetailsItem
        tooltip={t`The time each part of your TWAP order will remain active.`}
        label={t`Part duration`}
        withArrow={false}
      >
        {partDurationDisplay}
      </ConfirmDetailsItem>

      {/* Total duration */}
      <ConfirmDetailsItem
        tooltip={t`The time before your total TWAP order ends.`}
        label={t`Total duration`}
        withArrow={false}
      >
        {totalDurationDisplay}
      </ConfirmDetailsItem>
    </Wrapper>
  )
})
