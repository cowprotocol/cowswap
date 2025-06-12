import React, { ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { BridgeStatus } from '@cowprotocol/cow-sdk'

import { DetailRow } from '../../../common/DetailRow'
import { BridgeDetailsTooltips } from '../bridgeDetailsTooltips'
import { RefundStatus, RefundStatusEnum } from '../RefundStatus'

export function RefundStatusItem({
  bridgeStatus,
  hash,
}: {
  bridgeStatus: BridgeStatus
  hash: string | undefined
}): ReactNode {
  if (bridgeStatus !== BridgeStatus.EXPIRED || !hash) {
    return null
  }

  return (
    <DetailRow label="Refund Status" tooltipText="Status of the refund process for the failed bridge transaction">
      <RefundStatus
        status={RefundStatusEnum.NOT_INITIATED} // TODO: add refund statuses once we have them
      />
    </DetailRow>
  )
}

export function BridgingTime({
  bridgeStatus,
  fillTimeInSeconds,
}: {
  bridgeStatus: BridgeStatus
  fillTimeInSeconds: number | undefined
}): ReactNode {
  if (bridgeStatus !== BridgeStatus.IN_PROGRESS || fillTimeInSeconds === undefined) {
    return null
  }

  return (
    <DetailRow label="Bridging Time" tooltipText={BridgeDetailsTooltips.bridgingTime}>
      {displayTime(fillTimeInSeconds, true)}
    </DetailRow>
  )
}
