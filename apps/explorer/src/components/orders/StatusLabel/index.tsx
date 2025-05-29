import { ReactNode } from 'react'

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
import { formatPercentage } from 'utils'

import { Wrapper, Label, StyledFAIcon, GenericStatus as StyledGenericStatus } from './styled'

const ORDER_STATUSES = {
  OPEN: 'open',
  FILLED: 'filled',
  CANCELLED: 'cancelled',
  CANCELLING: 'cancelling',
  EXPIRED: 'expired',
  SIGNING: 'signing',
  PARTIALLY_FILLED: 'partially filled',
} as const

const BRIDGE_STATUSES = {
  PENDING: BridgeStatus.Pending.toLowerCase(),
  IN_PROGRESS: BridgeStatus.InProgress.toLowerCase(),
  REFUNDING: BridgeStatus.Refunding.toLowerCase(),
  COMPLETED: BridgeStatus.Completed.toLowerCase(),
  REFUND_COMPLETE: BridgeStatus.RefundComplete.toLowerCase(),
  FAILED: BridgeStatus.Failed.toLowerCase(),
  UNKNOWN: BridgeStatus.Unknown.toLowerCase(),
} as const

// Utility function to capitalize status values for display
const capitalizeStatus = (status: string): string => {
  return status
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// O(1) lookup for shimmed statuses using Set
const SHIMMED_STATUSES = new Set<string>([
  ORDER_STATUSES.SIGNING,
  ORDER_STATUSES.CANCELLING,
  BRIDGE_STATUSES.PENDING,
  BRIDGE_STATUSES.IN_PROGRESS,
  BRIDGE_STATUSES.REFUNDING,
])

const STATUS_ICON_MAP = new Map<string, IconDefinition>([
  [ORDER_STATUSES.EXPIRED, faClock],
  [ORDER_STATUSES.FILLED, faCheckCircle],
  [ORDER_STATUSES.CANCELLED, faTimesCircle],
  [ORDER_STATUSES.CANCELLING, faTimesCircle],
  [ORDER_STATUSES.SIGNING, faKey],
  [ORDER_STATUSES.OPEN, faCircleNotch],
  [ORDER_STATUSES.PARTIALLY_FILLED, faCircleHalfStroke],
  [BRIDGE_STATUSES.PENDING, faSpinner],
  [BRIDGE_STATUSES.IN_PROGRESS, faSpinner],
  [BRIDGE_STATUSES.COMPLETED, faCheckCircle],
  [BRIDGE_STATUSES.REFUND_COMPLETE, faCheckCircle],
  [BRIDGE_STATUSES.FAILED, faExclamationCircle],
  [BRIDGE_STATUSES.REFUNDING, faExclamationCircle],
])

const SPINNING_STATUSES = new Set<string>([ORDER_STATUSES.OPEN, BRIDGE_STATUSES.PENDING, BRIDGE_STATUSES.IN_PROGRESS])
const PARTIALLY_FILLABLE_STATUSES = new Set<string>([ORDER_STATUSES.OPEN, ORDER_STATUSES.CANCELLING])

const shouldBeShimmed = (lowerStatus: string): boolean => SHIMMED_STATUSES.has(lowerStatus)
const canBePartiallyFilled = (lowerStatus: string): boolean => PARTIALLY_FILLABLE_STATUSES.has(lowerStatus)
const getStatusIcon = (lowerStatus: string): IconDefinition => STATUS_ICON_MAP.get(lowerStatus) ?? faQuestionCircle
const shouldSpin = (lowerStatus: string): boolean => SPINNING_STATUSES.has(lowerStatus)

const formatDisplayText = (status: string): string => {
  const lowerStatus = status.toLowerCase()
  const knownStatus = Object.values(ORDER_STATUSES).find((orderStatus) => orderStatus === lowerStatus)
  if (knownStatus) {
    return capitalizeStatus(knownStatus)
  }

  // Fallback to dynamic transformation for bridge statuses
  return (
    status.charAt(0).toUpperCase() +
    status
      .slice(1)
      .replace(/([A-Z])/g, ' $1')
      .trim()
  )
}

function StatusIcon({ status }: { status: string }): ReactNode {
  const lowerStatus = status.toLowerCase()
  const icon = getStatusIcon(lowerStatus)
  const isSpinning = shouldSpin(lowerStatus)

  return <StyledFAIcon icon={icon} spin={isSpinning} />
}

export type PartiallyTagPosition = 'right' | 'bottom'

export type Props = {
  status: string
  partiallyFilled?: boolean
  filledPercentage?: BigNumber
  partialTagPosition?: PartiallyTagPosition
}

export function StatusLabel({
  status,
  partiallyFilled = false,
  filledPercentage,
  partialTagPosition = 'bottom',
}: Props): ReactNode {
  const lowerStatus = status.toLowerCase()
  const shimming = shouldBeShimmed(lowerStatus)
  const customizeStatus = lowerStatus === ORDER_STATUSES.EXPIRED || lowerStatus === ORDER_STATUSES.CANCELLED
  const tagPartiallyFilled = partiallyFilled && canBePartiallyFilled(lowerStatus)
  const formattedPercentage = filledPercentage !== undefined ? formatPercentage(filledPercentage) : undefined

  const displayStatus: StyledGenericStatus =
    customizeStatus && partiallyFilled ? ORDER_STATUSES.PARTIALLY_FILLED : status

  const displayText = formatDisplayText(displayStatus)

  return (
    <Wrapper
      partialFill={tagPartiallyFilled}
      tagPosition={partialTagPosition}
      filledPercentage={formattedPercentage || capitalizeStatus(ORDER_STATUSES.PARTIALLY_FILLED)}
    >
      <Label
        status={displayStatus}
        shimming={shimming}
        partialFill={tagPartiallyFilled}
        tagPosition={partialTagPosition}
      >
        <StatusIcon status={displayStatus} />
        {displayText}
      </Label>
    </Wrapper>
  )
}
