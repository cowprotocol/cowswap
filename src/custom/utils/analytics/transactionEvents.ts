import { Category, _reportEvent } from './index'

type ExpirationType = 'Default' | 'Custom'
export function orderExpirationTimeAnalytics(type: ExpirationType, value: number) {
  _reportEvent({
    category: Category.ORDER_EXPIRATION_TIME,
    action: `Set ${type} Expiration Time`,
    value,
  })
}

type WrapAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function wrapAnalytics(action: WrapAction, message: string) {
  _reportEvent({
    category: Category.WRAP_NATIVE_TOKEN,
    action: `${action} Wrap/Unwrap Transaction`,
    label: message,
  })
}

type ClaimAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function claimAnalytics(action: ClaimAction, value?: number) {
  _reportEvent({
    category: Category.CLAIM_COW_FOR_LOCKED_GNO,
    action: `${action} Claim Transaction`,
    value,
  })
}

type ApprovalAction = 'Send' | 'Sign' | 'Reject' | 'Error'
export function approvalAnalytics(action: ApprovalAction, label?: string, value?: number) {
  _reportEvent({
    category: Category.SWAP,
    action: `${action} Token Approval`,
    label,
    value,
  })
}

export type SwapAction = 'Send' | 'Error' | 'Reject'
export function swapAnalytics(action: SwapAction, label?: string, value?: number) {
  _reportEvent({
    category: Category.SWAP,
    action: `${action} Swap Order`,
    label,
    value,
  })
}

const signSwapActions = {
  Sign: 'Signed: Swap',
  SignAndSend: 'Signed: Swap and send',
  SignToSelf: 'Signed: Swap and send to self',
}

export type SignSwapAction = 'Sign' | 'SignAndSend' | 'SignToSelf'
export function signSwapAnalytics(action: SignSwapAction, label?: string) {
  _reportEvent({
    category: Category.SWAP,
    action: signSwapActions[action],
    label,
  })
}

export type OrderType = 'Posted' | 'Executed' | 'Canceled' | 'Expired'
export function orderAnalytics(action: OrderType, label?: string) {
  _reportEvent({
    category: Category.SWAP,
    action: `${action} Swap Order`,
    label,
  })
}

export function setMaxSellTokensAnalytics() {
  _reportEvent({
    category: Category.SWAP,
    action: 'Set Maximun Sell Tokens',
  })
}

export function priceOutOfRangeAnalytics(isUnfillable: boolean, label: string) {
  _reportEvent({
    category: Category.SWAP,
    action: `Order price is ${isUnfillable ? 'out of' : 'back to'} market`,
    label,
  })
}
