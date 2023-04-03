import { OrderClass } from '@cowprotocol/cow-sdk'
import { sendEvent } from '../index'
import { Category } from '../types'

import { PIXEL_EVENTS } from '../pixel/constants'
import { sendFacebookEvent } from '../pixel/facebook'
import { sendLinkedinEvent } from '../pixel/linkedin'
import { sendTwitterEvent } from '../pixel/twitter'
import { sendRedditEvent } from '../pixel/reddit'
import { sendPavedEvent } from '../pixel/paved'
import { sendMicrosoftEvent } from '../pixel/microsoft'

const LABEL_FROM_CLASS: Record<OrderClass, string> = {
  [OrderClass.LIMIT]: 'Limit Order',
  [OrderClass.MARKET]: 'Market Order',
  [OrderClass.LIQUIDITY]: 'Liquidity Order',
}

function getClassLabel(orderClass: OrderClass, label?: string) {
  const classLabel = LABEL_FROM_CLASS[orderClass]
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
    category: Category.SWAP,
    action: `${action} Token Approval`,
    label,
    value,
  })
}

export type SwapAction = 'Send' | 'Error' | 'Reject'
export function swapAnalytics(action: SwapAction, orderClass: OrderClass, label?: string, value?: number) {
  sendEvent({
    category: Category.SWAP,
    action,
    label: getClassLabel(orderClass, label),
    value,
  })
}

export function signSwapAnalytics(orderClass: OrderClass, label?: string) {
  sendEvent({
    category: Category.SWAP,
    action: 'Sign',
    label: getClassLabel(orderClass, label),
  })
}

export type OrderType = 'Posted' | 'Executed' | 'Canceled' | 'Expired'
export function orderAnalytics(action: OrderType, orderClass: OrderClass, label?: string) {
  if (action === 'Posted') {
    sendFacebookEvent(PIXEL_EVENTS.POST_TRADE)
    sendLinkedinEvent(PIXEL_EVENTS.POST_TRADE)
    sendTwitterEvent(PIXEL_EVENTS.POST_TRADE)
    sendRedditEvent(PIXEL_EVENTS.POST_TRADE)
    sendPavedEvent(PIXEL_EVENTS.POST_TRADE)
    sendMicrosoftEvent(PIXEL_EVENTS.POST_TRADE)
  }

  sendEvent({
    category: Category.SWAP,
    action,
    label: getClassLabel(orderClass, label),
  })
}

export function priceOutOfRangeAnalytics(isUnfillable: boolean, label: string) {
  sendEvent({
    category: Category.SWAP,
    action: `Order price is ${isUnfillable ? 'out of' : 'back to'} market`,
    label,
  })
}
