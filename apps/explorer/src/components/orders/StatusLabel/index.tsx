import React, { ReactNode } from 'react'

import { BridgeStatus } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'
import { capitalize, formatPercentage } from 'utils'

import { OrderStatus } from 'api/operator'
import { canBePartiallyFilled } from 'utils/statusHelpers'

import { StatusIcon } from './StatusIcon'
import { Wrapper, Label, GenericStatus as StyledGenericStatus } from './styled'

export type PartiallyTagPosition = 'right' | 'bottom'

export type StatusLabelProps = {
  status: string
  partiallyFilled?: boolean
  filledPercentage?: BigNumber
  partialTagPosition?: PartiallyTagPosition
  customText?: string
}

const SHIMMING_STATUSES = [
  OrderStatus.Signing.toLowerCase(),
  OrderStatus.Cancelling.toLowerCase(),
  BridgeStatus.IN_PROGRESS.toLowerCase(),
]

const FINAL_STATUSES = [OrderStatus.Expired.toLowerCase(), OrderStatus.Cancelled.toLowerCase()]

export function StatusLabel({
  status: _status,
  partiallyFilled = false,
  filledPercentage,
  partialTagPosition = 'bottom',
  customText,
}: StatusLabelProps): ReactNode {
  const status = _status.toLowerCase()
  const shimming = SHIMMING_STATUSES.includes(status)
  const customizeStatus = FINAL_STATUSES.includes(status)

  const tagPartiallyFilled =
    partiallyFilled && typeof status === 'string' && canBePartiallyFilled(status as OrderStatus)

  const formattedPercentage = filledPercentage !== undefined && formatPercentage(filledPercentage)

  const displayStatus: StyledGenericStatus = customizeStatus && partiallyFilled ? OrderStatus.PartiallyFilled : status

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
        {customText || capitalize(displayStatus.replace(/([A-Z])/g, ' $1').trim())}
      </Label>
    </Wrapper>
  )
}
