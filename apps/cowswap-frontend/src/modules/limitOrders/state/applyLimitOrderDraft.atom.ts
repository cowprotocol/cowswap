import { atom, SetStateAction } from 'jotai'

import { FractionUtils } from '@cowprotocol/common-utils'
import { areAddressesEqual, OrderKind } from '@cowprotocol/cow-sdk'

import { pendingLimitOrderDraftAtom, PendingLimitOrderDraft } from 'modules/limitOrderDraft'

import { updateLimitOrdersRawStateAtom } from './limitOrdersRawStateAtom'
import { updateLimitOrdersSettingsAtom } from './limitOrdersSettingsAtom'
import { initLimitRateState, limitRateAtom, LimitRateState, updateLimitRateAtom } from './limitRateAtom'
import { partiallyFillableOverrideAtom } from './partiallyFillableOverride'

export const applyLimitOrderDraftAtom = atom(null, (get, set, request: PendingLimitOrderDraft) => {
  if (get(pendingLimitOrderDraftAtom) !== request) return

  const { draft } = request
  set(updateLimitOrdersRawStateAtom, {
    inputCurrencyAmount: FractionUtils.serializeFractionToJSON(draft.inputAmount),
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
    recipient: null,
    recipientAddress: null,
    isUnlocked: true,
  })
  const rateState: Partial<LimitRateState> = {
    ...initLimitRateState(),
    isDraftInitialized: true,
    percentageSelection: draft.price?.type === 'percentage' ? { value: draft.price.value, isInverted: false } : null,
    focusCustomPercentage: draft.price?.type === 'custom',
  }
  set<null, [SetStateAction<Partial<LimitRateState>>], void>(updateLimitRateAtom, rateState)
  set(updateLimitOrdersSettingsAtom, { showRecipient: false })
  set(partiallyFillableOverrideAtom, undefined)
  set(pendingLimitOrderDraftAtom, null)
})

export const isLimitOrderDraftActiveAtom = atom(
  (get) => !!get(pendingLimitOrderDraftAtom) || get(limitRateAtom).isDraftInitialized,
)

export interface LimitOrderDraftSession {
  pathname: string
  account: string | undefined
  chainId: number
}

export function matchesLimitOrderDraftSession(
  request: PendingLimitOrderDraft,
  session: LimitOrderDraftSession,
): boolean {
  const sameAccount =
    request.account && session.account
      ? areAddressesEqual(request.account, session.account)
      : !request.account && !session.account
  return (
    sameAccount &&
    request.pathname === session.pathname &&
    request.draft.inputAmount.currency.chainId === session.chainId
  )
}

export const resetLimitOrderDraftSessionAtom = atom(null, (get, set, session: LimitOrderDraftSession) => {
  const request = get(pendingLimitOrderDraftAtom)
  if (request && matchesLimitOrderDraftSession(request, session)) set(pendingLimitOrderDraftAtom, null)
  set<null, [SetStateAction<Partial<LimitRateState>>], void>(updateLimitRateAtom, {
    isDraftInitialized: false,
    focusCustomPercentage: false,
    percentageSelection: null,
  })
})
