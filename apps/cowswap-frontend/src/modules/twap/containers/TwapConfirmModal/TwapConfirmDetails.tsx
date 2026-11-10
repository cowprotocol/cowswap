import { useAtomValue } from 'jotai'
import React, { ReactNode, useCallback, useRef, useState } from 'react'

import { COW_BATCH_TIME_SECONDS } from '@cowprotocol/common-const'
import { useCountdown } from '@cowprotocol/common-hooks'
import { formatBatchCountdown } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
import { Plural, Trans } from '@lingui/react/macro'

import { cowBatchValidFromAtom, useGetReceiveAmountInfo } from 'modules/trade'
import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReviewOrderModalAmountRow } from 'modules/trade/pure/ReviewOrderModalAmountRow'
import { useUsdAmount } from 'modules/usdAmount'

import * as styledEl from './TwapConfirmDetails.styled'

import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { getTwapCowBatchStartTime } from '../../utils/twapCowBatchCadence'

export type TwapConfirmDetailsProps = {
  startsAtCowBatch: boolean
  numOfParts: number | undefined
  partDuration: number | undefined
  totalDuration: number | undefined
}

export const TwapConfirmDetails = React.memo(function TwapConfirmDetails(props: TwapConfirmDetailsProps) {
  const { partDuration, totalDuration, numOfParts, startsAtCowBatch } = props

  const partsCount = numOfParts ?? 0
  const sellLabel = t`Sell amount per part (1/${partsCount})`
  const buyLabel = t`Buy amount per part (1/${partsCount})`
  const startTimeLabel = t`Start time first part (1/${partsCount})`

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
          TWAP order split in{' '}
          <b>
            <Plural
              value={partsCount}
              one="# equal part"
              few="# equal parts"
              many="# equal parts"
              other="# equal parts"
            />
          </b>
        </Trans>
      </styledEl.TwapSplitTitle>

      {/* Sell amount per part */}
      <ReviewOrderModalAmountRow
        amount={inputPartAmountToSign}
        fiatAmount={inputPartAmountUsd}
        tooltip={t`This is the amount that will be sold in each part of the TWAP order.`}
        label={sellLabel}
        withTimelineDot={true}
      />

      {/* Buy amount per part */}
      <ReviewOrderModalAmountRow
        amount={outputPartAmountToSign}
        fiatAmount={outputPartAmountUsd}
        tooltip={t`This is the estimated amount you will receive for each part of the TWAP order.`}
        label={buyLabel}
        isAmountAccurate={false}
        withTimelineDot={true}
      />

      {/* Start time */}
      <ConfirmDetailsItem
        tooltip={
          startsAtCowBatch
            ? t`The first part of your TWAP order will become active at the next CoW batch after you confirm the order below, so every part can be matched with other traders' orders.`
            : t`The first part of your TWAP order will become active as soon as you confirm the order below.`
        }
        label={startTimeLabel}
        withArrow={false}
      >
        {startsAtCowBatch ? <CowBatchStartCountdown /> : <Trans>Now</Trans>}
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

function CowBatchStartCountdown(): ReactNode {
  const countdownRef = useRef<HTMLSpanElement | null>(null)
  const nextBatch = useAtomValue(cowBatchValidFromAtom)
  const [skippedBatch, setSkippedBatch] = useState<number | undefined>(undefined)
  const isNextBatchSkipped = nextBatch !== undefined && nextBatch === skippedBatch
  const startTime = isNextBatchSkipped ? nextBatch + COW_BATCH_TIME_SECONDS : nextBatch

  const onRemainingChange = useCallback(
    (remainingSec: number) => {
      if (nextBatch === undefined || isNextBatchSkipped) return

      if (getTwapCowBatchStartTime(nextBatch - remainingSec) !== nextBatch) setSkippedBatch(nextBatch)
    },
    [isNextBatchSkipped, nextBatch],
  )

  useCountdown({ targetRef: countdownRef, targetEpochSec: startTime, format: formatBatchCountdown, onRemainingChange })

  // Single inline wrapper: the parent is a flex row, which would drop the space before the countdown
  return (
    <span>
      <Trans>
        Next CoW batch · in <span ref={countdownRef} />
      </Trans>
    </span>
  )
}
