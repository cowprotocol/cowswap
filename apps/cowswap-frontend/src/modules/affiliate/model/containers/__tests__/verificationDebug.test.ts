import { MutableRefObject } from 'react'

import type { CowAnalytics } from '@cowprotocol/analytics'

import {
  reduceClearPendingVerification,
  reduceCloseModal,
  reduceCompleteVerification,
  reduceDisableEditMode,
  reduceEnableEditMode,
  reduceOpenModal,
  reduceRemoveCode,
  reduceRequestVerification,
  reduceSaveCode,
  reduceSetIncomingCode,
  reduceSetIncomingCodeReason,
  reduceSetInputCode,
  reduceSetSavedCode,
  reduceSetShouldAutoVerify,
  reduceSetWalletState,
  reduceStartVerification,
} from '../../state/referralReducers'
import { ReferralActions, ReferralDomainState, ReferralVerificationStatus, WalletReferralState } from '../../types'
import { performVerification } from '../verificationLogic'

// This harness spins the reducers manually so we can assert on the full verification flow
// without mounting React: it mirrors the controller's store updates and uses a noop analytics client.
function createInitialState(): ReferralDomainState {
  return {
    modalOpen: false,
    modalSource: null,
    editMode: false,
    inputCode: '',
    savedCode: 'DEBUGVALID',
    incomingCode: undefined,
    incomingCodeReason: undefined,
    previousVerification: undefined,
    verification: { kind: 'valid', code: 'DEBUGVALID', eligible: true, programActive: true },
    wallet: { status: 'eligible' },
    shouldAutoVerify: false,
    lastVerificationRequest: undefined,
    pendingVerificationRequest: undefined,
  }
}

type SetState = (updater: (prev: ReferralDomainState) => ReferralDomainState) => void

function wrapReducer<A extends unknown[]>(
  setState: SetState,
  reducer: (state: ReferralDomainState, ...args: A) => ReferralDomainState,
): (...args: A) => void {
  return (...args: A) => {
    setState((prev) => reducer(prev, ...args))
  }
}

function buildActions(setState: SetState): ReferralActions {
  return {
    openModal: wrapReducer(setState, reduceOpenModal),
    closeModal: wrapReducer(setState, reduceCloseModal),
    setInputCode: wrapReducer(setState, reduceSetInputCode),
    enableEditMode: wrapReducer(setState, reduceEnableEditMode),
    disableEditMode: wrapReducer(setState, reduceDisableEditMode),
    saveCode: wrapReducer(setState, reduceSaveCode),
    removeCode: wrapReducer(setState, reduceRemoveCode),
    setIncomingCode: wrapReducer(setState, reduceSetIncomingCode),
    setIncomingCodeReason: wrapReducer(setState, reduceSetIncomingCodeReason),
    setWalletState: wrapReducer(setState, reduceSetWalletState),
    startVerification: wrapReducer(setState, reduceStartVerification),
    completeVerification: wrapReducer(setState, reduceCompleteVerification),
    setShouldAutoVerify: wrapReducer(setState, reduceSetShouldAutoVerify),
    setSavedCode: wrapReducer(setState, reduceSetSavedCode),
    requestVerification: wrapReducer(setState, reduceRequestVerification),
    clearPendingVerification: wrapReducer(setState, reduceClearPendingVerification),
    registerCancelVerification: () => undefined,
  }
}

describe('debug verification scenarios', () => {
  it('promotes valid code to linked when DEBUGLINKED is verified', async () => {
    let state = createInitialState()
    const setState: SetState = (updater) => {
      state = updater(state)
    }

    const actions = buildActions(setState)

    actions.openModal('deeplink', { code: 'DEBUGLINKED' })
    actions.setIncomingCode('DEBUGLINKED')
    actions.requestVerification('DEBUGLINKED')

    const pendingId = state.pendingVerificationRequest?.id
    expect(pendingId).toBeDefined()

    const applyVerificationResult = (status: ReferralVerificationStatus, walletState?: WalletReferralState): void => {
      actions.completeVerification(status)
      if (walletState) {
        actions.setWalletState(walletState)
      }
    }

    const analytics: CowAnalytics = createNoopAnalytics()

    const pendingVerificationRef: MutableRefObject<number | null> = { current: null }
    const trackVerifyResult = (): void => undefined

    await performVerification({
      rawCode: 'DEBUGLINKED',
      account: '0xabc',
      chainId: 1,
      supportedNetwork: true,
      toggleWalletModal: () => undefined,
      actions,
      analytics,
      pendingVerificationRef,
      applyVerificationResult,
      trackVerifyResult,
      incomingCode: state.incomingCode,
      savedCode: state.savedCode,
      currentVerification: state.verification,
      previousVerification: state.previousVerification,
    })

    if (pendingId) {
      actions.clearPendingVerification(pendingId)
    }

    expect(state.savedCode).toBe('DEBUGLINKED')
    expect(state.verification.kind).toBe('linked')
    expect(state.wallet).toEqual({ status: 'linked', code: 'DEBUGLINKED' })
  })
})

function createNoopAnalytics(): CowAnalytics {
  return {
    setUserAccount: () => undefined,
    sendPageView: () => undefined,
    sendEvent: () => undefined,
    sendTiming: () => undefined,
    sendError: () => undefined,
    outboundLink: () => undefined,
    setContext: () => undefined,
  }
}
