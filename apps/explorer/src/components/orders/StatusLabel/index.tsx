import React from 'react'

import { BridgeStatus } from '@cowprotocol/bridge'

import {
  faCheckCircle,
  faCircleNotch,
  faClock,
  faTimesCircle,
  IconDefinition,
  faKey,
  faCircleHalfStroke,
  faSpinner,
  faExclamationCircle,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons'
import BigNumber from 'bignumber.js'
import { capitalize, formatPercentage } from 'utils'

import { OrderStatus } from 'api/operator'

import { Wrapper, Label, StyledFAIcon, GenericStatus as StyledGenericStatus } from './styled'

export type GenericStatus = string
export type PartiallyTagPosition = 'right' | 'bottom'

function canBePartiallyFilled(status: string): status is OrderStatus {
  return ['open', 'cancelling'].includes(status)
}

function getStatusIcon(status: StyledGenericStatus): IconDefinition {
  switch (status.toLowerCase()) {
    case 'expired':
      return faClock
    case 'filled':
      return faCheckCircle
    case 'cancelled':
      return faTimesCircle
    case 'cancelling':
      return faTimesCircle
    case 'signing':
      return faKey
    case 'open':
      return faCircleNotch
    case 'partially filled':
      return faCircleHalfStroke
    case BridgeStatus.Pending.toLowerCase():
      return faClock
    case BridgeStatus.InProgress.toLowerCase():
      return faSpinner
    case BridgeStatus.Completed.toLowerCase():
    case BridgeStatus.RefundComplete.toLowerCase():
      return faCheckCircle
    case BridgeStatus.Failed.toLowerCase():
    case BridgeStatus.Refunding.toLowerCase():
      return faExclamationCircle
    case BridgeStatus.Unknown.toLowerCase():
    default:
      return faQuestionCircle
  }
}

function StatusIcon({ status }: { status: StyledGenericStatus }): React.ReactNode {
  const icon = getStatusIcon(status)
  const isSpinning = status.toLowerCase() === 'open' || status.toLowerCase() === BridgeStatus.InProgress.toLowerCase()

  return <StyledFAIcon icon={icon} spin={isSpinning} />
}

export type Props = {
  status: GenericStatus
  partiallyFilled?: boolean
  filledPercentage?: BigNumber
  partialTagPosition?: PartiallyTagPosition
  customText?: string
}

export function StatusLabel({
  status,
  partiallyFilled = false,
  filledPercentage,
  partialTagPosition = 'bottom',
  customText,
}: Props): React.ReactNode {
  const shimming =
    status.toLowerCase() === 'signing' ||
    status.toLowerCase() === 'cancelling' ||
    status.toLowerCase() === BridgeStatus.InProgress.toLowerCase() ||
    status.toLowerCase() === BridgeStatus.Refunding.toLowerCase()

  const customizeStatus = status.toLowerCase() === 'expired' || status.toLowerCase() === 'cancelled'
  const tagPartiallyFilled =
    partiallyFilled && typeof status === 'string' && canBePartiallyFilled(status as OrderStatus)

  const formattedPercentage = filledPercentage !== undefined && formatPercentage(filledPercentage)

  let displayStatus: StyledGenericStatus = status
  if (customizeStatus && partiallyFilled) {
    displayStatus = 'partially filled'
  }

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
