import { BridgeStatus } from '@cowprotocol/cow-sdk'

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

import { OrderStatus } from 'api/operator'

export type GenericStatus = string

export function canBePartiallyFilled(status: string): status is OrderStatus {
  return [OrderStatus.Open, OrderStatus.Cancelling].includes(status as OrderStatus)
}

// eslint-disable-next-line complexity
export function getStatusIcon(status: GenericStatus): IconDefinition {
  switch (status.toLowerCase()) {
    case OrderStatus.Expired.toLowerCase():
      return faClock
    case OrderStatus.Filled.toLowerCase():
      return faCheckCircle
    case OrderStatus.Cancelled.toLowerCase():
      return faTimesCircle
    case OrderStatus.Cancelling.toLowerCase():
      return faTimesCircle
    case OrderStatus.Signing.toLowerCase():
      return faKey
    case OrderStatus.Open.toLowerCase():
      return faCircleNotch
    case OrderStatus.PartiallyFilled.toLowerCase():
      return faCircleHalfStroke
    case BridgeStatus.UNKNOWN.toLowerCase():
      return faClock
    case BridgeStatus.IN_PROGRESS.toLowerCase():
      return faSpinner
    case BridgeStatus.EXECUTED.toLowerCase():
    case BridgeStatus.REFUND.toLowerCase():
      return faCheckCircle
    case BridgeStatus.EXPIRED.toLowerCase():
      return faExclamationCircle
    default:
      return faQuestionCircle
  }
}
