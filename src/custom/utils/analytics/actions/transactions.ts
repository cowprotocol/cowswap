import { Category } from '../types'
import { _reportEvent } from '../utils'

const types = {
  maxSellTokens: 'Set Maximun Sell Tokens',
  expirationTime: {
    default: 'Set Default Expiration Time',
    custom: 'Set Custom Expiration Time',
  },
  wrap: {
    send: 'Send Wrap/Unwrap Transaction to Wallet',
    sign: 'Sign Wrap/Unwrap Transaction',
    reject: 'Reject Wrap/Unwrap Signing transaction',
    error: 'Error Wrap/Unwrap Signing transaction',
  },
  claim: {
    send: 'Send Claim Transaction to Wallet',
    sign: 'Sign Claim Transaction',
    reject: 'Reject Claim Signing Transaction',
    error: 'Error Claim Signing Transaction',
  },
  approval: {
    send: 'Send Token Approval to Wallet',
    sign: 'Sign Token Approval',
    reject: 'Reject Token Approval',
    error: 'Signing Error for Token Approval',
  },
  swap: {
    send: 'Send Order to Wallet',
    signedSwap: 'Signed: Swap',
    signedSwapSelf: 'Signed: Swap and Send to Self',
    signedSwapSend: 'Signed: Swap and Send',
    reject: 'Reject Swap',
    error: 'Signing Swap Error',
  },
  order: {
    posted: 'Posted Order',
    executed: 'Executed Swap',
    cancel: 'Canceled Order',
    expired: 'Expired Order',
  },
}

type expirationTimeType = keyof typeof types.expirationTime
export function orderExpirationTimeAnalytics(option: expirationTimeType, value: number) {
  _reportEvent({
    category: Category.ORDER_EXPIRATION_TIME,
    action: types.expirationTime[option],
    value,
  })
}

type wrapTransactionType = keyof typeof types.wrap
export function wrapTransactionAnalytics(option: wrapTransactionType, message: string) {
  _reportEvent({
    category: Category.WRAP_NATIVE_TOKEN,
    action: types.wrap[option],
    label: message,
  })
}

type claimTransactionType = keyof typeof types.claim
export function claimTransactionAnalytics(option: claimTransactionType, value?: number) {
  _reportEvent({
    category: Category.CLAIM_COW_FOR_LOCKED_GNO,
    action: types.claim[option],
    value,
  })
}

type approvalTransactionType = keyof typeof types.approval
export function approvalTransactionAnalytics(option: approvalTransactionType, label?: string, value?: number) {
  _reportEvent({
    category: Category.SWAP,
    action: types.approval[option],
    label,
    value,
  })
}

export type swapTransactionType = keyof typeof types.swap
export function swapTransactionAnalytics(option: swapTransactionType, label?: string, value?: number) {
  _reportEvent({
    category: Category.SWAP,
    action: types.swap[option],
    label,
    value,
  })
}

export type orderType = keyof typeof types.order
export function orderAnalytics(option: orderType, label?: string) {
  _reportEvent({
    category: Category.SWAP,
    action: types.order[option],
    label,
  })
}

export function setMaxSellTokens() {
  _reportEvent({
    category: Category.SWAP,
    action: types.maxSellTokens,
  })
}
