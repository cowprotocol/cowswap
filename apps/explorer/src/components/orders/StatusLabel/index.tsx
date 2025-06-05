import React from 'react'

import { BridgeStatus } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'
import { capitalize, formatPercentage } from 'utils'

import { OrderStatus } from 'api/operator'
import { canBePartiallyFilled } from 'utils/statusHelpers'

import { StatusIcon } from './StatusIcon'
import { Wrapper, Label, GenericStatus as StyledGenericStatus } from './styled'

export type PartiallyTagPosition = 'right' | 'bottom'

export type Props = {
  status: string
  partiallyFilled?: boolean
  filledPercentage?: BigNumber
  partialTagPosition?: PartiallyTagPosition
  customText?: string
}

export function StatusLabel({
  status: _status,
  partiallyFilled = false,
  filledPercentage,
  partialTagPosition = 'bottom',
  customText,
}: Props): React.ReactNode {
  const status = _status.toLowerCase()
  const shimming =
    status === OrderStatus.Signing.toLowerCase() ||
    status === OrderStatus.Cancelling.toLowerCase() ||
    status === BridgeStatus.IN_PROGRESS.toLowerCase()

  const customizeStatus = status === OrderStatus.Expired.toLowerCase() || status === OrderStatus.Cancelled.toLowerCase()

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
