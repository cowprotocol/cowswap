import React, { ReactNode } from 'react'

import { BridgeStatus } from '@cowprotocol/sdk-bridging'

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import { formatPercentage } from 'utils'

import { ORDER_FINAL_FAILED_STATUSES, OrderStatus } from 'api/operator'
import { canBePartiallyFilled } from 'utils/statusHelpers'

import { StatusIcon } from './StatusIcon'
import { CornerWarningIcon, GenericStatus as StyledGenericStatus, Label, Wrapper } from './styled'

export type PartiallyTagPosition = 'right' | 'bottom'

export type StatusLabelProps = {
  status: OrderStatus | BridgeStatus
  partiallyFilled?: boolean
  filledPercentage?: BigNumber
  partialTagPosition?: PartiallyTagPosition
  customText?: string
  warningLabel?: string
}

const SHIMMING_STATUSES = [
  OrderStatus.Signing.toLowerCase(),
  OrderStatus.Cancelling.toLowerCase(),
  BridgeStatus.IN_PROGRESS.toLowerCase(),
]

const FINAL_STATUSES = ORDER_FINAL_FAILED_STATUSES.map((t) => t.toLowerCase())

const bridgeStatusTitleMap: Record<BridgeStatus, string> = {
  [BridgeStatus.UNKNOWN]: 'UNKNOWN',
  [BridgeStatus.IN_PROGRESS]: 'IN PROGRESS',
  [BridgeStatus.EXECUTED]: 'EXECUTED',
  [BridgeStatus.EXPIRED]: 'EXPIRED',
  [BridgeStatus.REFUND]: 'REFUND',
}

export function StatusLabel({
  status: _status,
  partiallyFilled = false,
  filledPercentage,
  partialTagPosition = 'bottom',
  customText,
  warningLabel,
}: StatusLabelProps): ReactNode {
  const status = _status.toLowerCase()
  const shimming = SHIMMING_STATUSES.includes(status)
  const customizeStatus = FINAL_STATUSES.includes(status)

  const tagPartiallyFilled =
    partiallyFilled && typeof status === 'string' && canBePartiallyFilled(status as OrderStatus)

  const formattedPercentage = filledPercentage !== undefined && formatPercentage(filledPercentage)

  const displayStatus: StyledGenericStatus =
    customizeStatus && partiallyFilled ? OrderStatus.PartiallyFilled : bridgeStatusTitleMap[_status] || status

  return (
    <Wrapper
      partialFill={tagPartiallyFilled}
      tagPosition={partialTagPosition}
      filledPercentage={formattedPercentage || 'Partially filled'}
    >
      <Label
        status={displayStatus}
        shimming={shimming}
        partialFill={tagPartiallyFilled}
        tagPosition={partialTagPosition}
      >
        <StatusIcon status={displayStatus} />
        {customText || displayStatus.toUpperCase()}
        {warningLabel ? (
          <CornerWarningIcon title={warningLabel}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </CornerWarningIcon>
        ) : null}
      </Label>
    </Wrapper>
  )
}
