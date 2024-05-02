import { UiOrderType } from '@cowprotocol/types'

import { sendEvent } from '../googleAnalytics'
import { PixelEvent, sendAllPixels } from '../pixel'
import { Category } from '../types'

const LABEL_FROM_TYPE: Record<UiOrderType, string> = {
  [UiOrderType.LIMIT]: 'Limit Order',
  [UiOrderType.SWAP]: 'Market Order',
  [UiOrderType.TWAP]: 'TWAP Order',
}

function getClassLabel(orderClass: UiOrderType, label?: string) {
  const classLabel = LABEL_FROM_TYPE[orderClass]
  return label ? `${label}::${classLabel}` : classLabel
}

type ExpirationType = 'Default' | 'Custom'
export function orderExpirationTimeAnalytics(type: ExpirationType, value: number) {
  sendEvent({
    category: Category.ORDER_EXPIRATION_TIME,
    action: `Set ${type} Expiration Time`,
    value,
  })
}

type WrapAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function wrapAnalytics(action: WrapAction, message: string) {
  sendEvent({
    category: Category.WRAP_NATIVE_TOKEN,
    action: `${action} Wrap/Unwrap Transaction`,
    label: message,
  })
}

type ClaimAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function claimAnalytics(action: ClaimAction, value?: number) {
  sendEvent({
    category: Category.CLAIM_COW_FOR_LOCKED_GNO,
    action: `${action} Claim Transaction`,
    value,
  })
}

type ApprovalAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function approvalAnalytics(action: ApprovalAction, label?: string, value?: number) {
  sendEvent({
    category: Category.TRADE,
    action: `${action} Token Approval`,
    label,
    value,
  })
}

export type TradeAction =
  | 'Send'
  | 'Error'
  | 'Reject'
  | 'Bundle Approve and Swap'
  | 'Bundled Eth Flow'
  | 'Place Advanced Order'
export function tradeAnalytics(action: TradeAction, orderType: UiOrderType, label?: string, value?: number) {
  sendEvent({
    category: Category.TRADE,
    action,
    label: getClassLabel(orderType, label),
    value,
  })
}

export function signTradeAnalytics(orderType: UiOrderType, label?: string) {
  sendEvent({
    category: Category.TRADE,
    action: 'Sign',
    label: getClassLabel(orderType, label),
  })
}

export type OrderType = 'Posted' | 'Executed' | 'Canceled' | 'Expired'
export function orderAnalytics(action: OrderType, orderType: UiOrderType, label?: string) {
  if (action === 'Posted') {
    sendAllPixels(PixelEvent.POST_TRADE)
  }

  sendEvent({
    category: Category.TRADE,
    action,
    label: getClassLabel(orderType, label),
  })
}

export function priceOutOfRangeAnalytics(isUnfillable: boolean, label: string) {
  sendEvent({
    category: Category.TRADE,
    action: `Order price is ${isUnfillable ? 'out of' : 'back to'} market`,
    label,
  })
}

export function alternativeModalAnalytics(isEdit: boolean, action: 'clicked' | 'placed') {
  sendEvent({
    category: Category.TRADE,
    action: `${isEdit ? 'Edit' : 'Recreate'} order: ${action}`,
  })
}
