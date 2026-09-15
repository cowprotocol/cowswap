import React from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useGetReceiveAmountInfo } from 'modules/trade'
import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReviewOrderModalAmountRow } from 'modules/trade/pure/ReviewOrderModalAmountRow'
import { useUsdAmount } from 'modules/usdAmount'

import * as styledEl from './TwapConfirmDetails.styled'

import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'

export type TwapConfirmDetailsProps = {
  startTime: number | undefined
  numOfParts: number | undefined
  partDuration: number | undefined
  totalDuration: number | undefined
}

export const TwapConfirmDetails = React.memo(function TwapConfirmDetails(props: TwapConfirmDetailsProps) {
  const { partDuration, totalDuration, numOfParts } = props

  const partsSuffix = ' ' + t`part` + ` (1/${numOfParts})`
  const amountLabelSuffix = ' ' + t`amount per` + partsSuffix

  const partDurationDisplay = partDuration ? deadlinePartsDisplay(partDuration, true) : ''
  const totalDurationDisplay = totalDuration ? deadlinePartsDisplay(totalDuration, true) : ''

  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { sellAmount: inputPartAmountToSign, buyAmount: outputPartAmountToSign } =
    receiveAmountInfo?.amountsToSign || {}

  const inputPartAmountUsd = useUsdAmount(inputPartAmountToSign).value
  const outputPartAmountUsd = useUsdAmount(outputPartAmountToSign).value

  return (
    <styledEl.Wrapper>
      <styledEl.TwapSplitTitle>
        <Trans>
          TWAP order split in <b>{numOfParts} equal parts</b>
        </Trans>
      </styledEl.TwapSplitTitle>

      {/* Sell amount per part */}
      <ReviewOrderModalAmountRow
        amount={inputPartAmountToSign}
        fiatAmount={inputPartAmountUsd}
        tooltip={t`This is the amount that will be sold in each part of the TWAP order.`}
        label={t`Sell` + amountLabelSuffix}
        withTimelineDot={true}
      />

      {/* Buy amount per part */}
      <ReviewOrderModalAmountRow
        amount={outputPartAmountToSign}
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
    </styledEl.Wrapper>
  )
})
