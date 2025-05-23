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

import { OrderStatus } from 'api/operator'

export type GenericStatus = string

export function canBePartiallyFilled(status: string): status is OrderStatus {
  return [OrderStatus.Open, OrderStatus.Cancelling].includes(status as OrderStatus)
}

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
