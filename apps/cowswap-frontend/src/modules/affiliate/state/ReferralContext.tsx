import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'

import { isProdLike } from '@cowprotocol/common-utils'

import { REFERRAL_STORAGE_KEY } from '../constants'
import {
  ReferralActions,
  ReferralContextValue,
  ReferralDomainState,
  ReferralModalSource,
  ReferralVerificationStatus,
  WalletReferralState,
} from '../types'
import { sanitizeReferralCode } from '../utils/code'

export interface ReferralProviderProps {
  children: ReactNode
}

const initialState: ReferralDomainState = {
  modalOpen: false,
  modalSource: null,
  editMode: false,
  inputCode: '',
  savedCode: undefined,
  incomingCode: undefined,
  verification: { kind: 'idle' },
  wallet: { status: 'unknown' },
  shouldAutoVerify: false,
  lastVerificationRequest: undefined,
  pendingVerificationRequest: undefined,
}

const noop = (): void => undefined

const noopActions: ReferralActions = {
  openModal: noop,
  closeModal: noop,
  setInputCode: noop,
  enableEditMode: noop,
  disableEditMode: noop,
  saveCode: noop,
  removeCode: noop,
  setIncomingCode: noop,
  setWalletState: noop,
  startVerification: noop,
  completeVerification: noop,
  setShouldAutoVerify: noop,
  setSavedCode: noop,
  requestVerification: noop,
  clearPendingVerification: noop,
}

const ReferralContext = createContext<ReferralContextValue>({ ...initialState, actions: noopActions })

export function ReferralProvider({ children }: ReferralProviderProps): ReactNode {
  const value = useReferralStore()

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>
}

function useReferralStore(): ReferralContextValue {
  const [state, setState] = useState<ReferralDomainState>(initialState)

  useReferralHydration(setState)
  useReferralPersistence(state.savedCode)

  const actions = useReferralStoreActions(setState)

  return useMemo(
    () => ({
      ...state,
      actions,
    }),
    [actions, state],
  )
}

type SetReferralState = Dispatch<SetStateAction<ReferralDomainState>>

function useReferralHydration(setState: SetReferralState): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const stored = window.localStorage.getItem(REFERRAL_STORAGE_KEY)

      if (!stored) {
        return
      }

      const sanitized = sanitizeReferralCode(stored)

      if (!sanitized) {
        return
      }

      setState((prev) => reduceSetSavedCode(prev, sanitized))
    } catch (error) {
      if (!isProdLike) {
        console.warn('[Referral] Failed to read saved code from storage', error)
      }
    }
  }, [setState])
}

function useReferralPersistence(savedCode?: string): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      if (!savedCode) {
        window.localStorage.removeItem(REFERRAL_STORAGE_KEY)
      } else {
        window.localStorage.setItem(REFERRAL_STORAGE_KEY, savedCode)
      }
    } catch (error) {
      if (!isProdLike) {
        console.warn('[Referral] Failed to persist saved code', error)
      }
    }
  }, [savedCode])
}

function useStateReducerAction<A extends unknown[]>(
  setState: SetReferralState,
  reducer: (state: ReferralDomainState, ...args: A) => ReferralDomainState,
): (...args: A) => void {
  return useCallback(
    (...args: A) => {
      setState((prev) => reducer(prev, ...args))
    },
    [reducer, setState],
  )
}

function useReferralStoreActions(setState: SetReferralState): ReferralActions {
  const openModal = useStateReducerAction(setState, reduceOpenModal)
  const closeModal = useStateReducerAction(setState, reduceCloseModal)
  const setInputCode = useStateReducerAction(setState, reduceSetInputCode)
  const enableEditMode = useStateReducerAction(setState, reduceEnableEditMode)
  const disableEditMode = useStateReducerAction(setState, reduceDisableEditMode)
  const saveCode = useStateReducerAction(setState, reduceSaveCode)
  const removeCode = useStateReducerAction(setState, reduceRemoveCode)
  const setIncomingCode = useStateReducerAction(setState, reduceSetIncomingCode)
  const setWalletState = useStateReducerAction(setState, reduceSetWalletState)
  const startVerification = useStateReducerAction(setState, reduceStartVerification)
  const completeVerification = useStateReducerAction(setState, reduceCompleteVerification)
  const setShouldAutoVerify = useStateReducerAction(setState, reduceSetShouldAutoVerify)
  const setSavedCode = useStateReducerAction(setState, reduceSetSavedCode)
  const requestVerification = useStateReducerAction(setState, reduceRequestVerification)
  const clearPendingVerification = useStateReducerAction(setState, reduceClearPendingVerification)

  return useMemo(
    () => ({
      openModal,
      closeModal,
      setInputCode,
      enableEditMode,
      disableEditMode,
      saveCode,
      removeCode,
      setIncomingCode,
      setWalletState,
      startVerification,
      completeVerification,
      setShouldAutoVerify,
      setSavedCode,
      requestVerification,
      clearPendingVerification,
    }),
    [
      clearPendingVerification,
      closeModal,
      completeVerification,
      disableEditMode,
      enableEditMode,
      openModal,
      removeCode,
      requestVerification,
      saveCode,
      setIncomingCode,
      setInputCode,
      setSavedCode,
      setShouldAutoVerify,
      setWalletState,
      startVerification,
    ],
  )
}

function reduceOpenModal(
  prev: ReferralDomainState,
  source: ReferralModalSource,
  options?: { code?: string },
): ReferralDomainState {
  const sanitizedIncoming = options?.code ? sanitizeReferralCode(options.code) : undefined

  return {
    ...prev,
    modalOpen: true,
    modalSource: source,
    editMode: false,
    incomingCode: sanitizedIncoming,
    inputCode: sanitizedIncoming ?? (prev.inputCode || prev.savedCode || ''),
    verification:
      sanitizedIncoming && sanitizedIncoming !== prev.savedCode
        ? { kind: 'pending', code: sanitizedIncoming }
        : prev.verification,
  }
}

function reduceCloseModal(prev: ReferralDomainState): ReferralDomainState {
  return {
    ...prev,
    modalOpen: false,
    modalSource: null,
    editMode: false,
    incomingCode: undefined,
    pendingVerificationRequest: undefined,
  }
}

function reduceSetInputCode(prev: ReferralDomainState, value: string): ReferralDomainState {
  const sanitized = sanitizeReferralCode(value)

  return {
    ...prev,
    inputCode: sanitized,
    verification: prev.verification.kind === 'pending' ? prev.verification : { kind: 'idle' },
  }
}

function reduceEnableEditMode(prev: ReferralDomainState): ReferralDomainState {
  return {
    ...prev,
    editMode: true,
  }
}

function reduceDisableEditMode(prev: ReferralDomainState): ReferralDomainState {
  return {
    ...prev,
    editMode: false,
  }
}

function reduceSaveCode(prev: ReferralDomainState, value: string): ReferralDomainState {
  const sanitized = sanitizeReferralCode(value)

  if (!sanitized) {
    return {
      ...prev,
      savedCode: undefined,
      inputCode: '',
      verification: { kind: 'idle' },
      shouldAutoVerify: false,
    }
  }

  return {
    ...prev,
    savedCode: sanitized,
    inputCode: sanitized,
    verification: { kind: 'pending', code: sanitized },
    editMode: false,
    shouldAutoVerify: true,
  }
}

function reduceRemoveCode(prev: ReferralDomainState): ReferralDomainState {
  return {
    ...prev,
    savedCode: undefined,
    inputCode: '',
    incomingCode: undefined,
    verification: { kind: 'idle' },
    shouldAutoVerify: false,
  }
}

function reduceSetIncomingCode(prev: ReferralDomainState, code?: string): ReferralDomainState {
  return {
    ...prev,
    incomingCode: code ? sanitizeReferralCode(code) : undefined,
  }
}

function reduceSetWalletState(prev: ReferralDomainState, walletState: WalletReferralState): ReferralDomainState {
  return {
    ...prev,
    wallet: walletState,
  }
}

function reduceStartVerification(prev: ReferralDomainState, code: string): ReferralDomainState {
  const sanitized = sanitizeReferralCode(code)

  if (!sanitized) {
    return prev
  }

  return {
    ...prev,
    verification: { kind: 'checking', code: sanitized },
    shouldAutoVerify: false,
    lastVerificationRequest: { code: sanitized, timestamp: Date.now() },
  }
}

function reduceCompleteVerification(
  prev: ReferralDomainState,
  status: ReferralVerificationStatus,
): ReferralDomainState {
  return {
    ...prev,
    verification: status,
    shouldAutoVerify: false,
  }
}

function reduceSetShouldAutoVerify(prev: ReferralDomainState, value: boolean): ReferralDomainState {
  return {
    ...prev,
    shouldAutoVerify: value,
  }
}

function reduceSetSavedCode(prev: ReferralDomainState, value?: string): ReferralDomainState {
  const sanitized = value ? sanitizeReferralCode(value) : undefined

  if (!sanitized) {
    return {
      ...prev,
      savedCode: undefined,
      inputCode: '',
      verification: { kind: 'idle' },
      shouldAutoVerify: false,
    }
  }

  return {
    ...prev,
    savedCode: sanitized,
    inputCode: sanitized,
    verification: { kind: 'pending', code: sanitized },
    shouldAutoVerify: true,
  }
}

function reduceRequestVerification(prev: ReferralDomainState, code?: string): ReferralDomainState {
  return {
    ...prev,
    pendingVerificationRequest: { id: Date.now(), code: code ? sanitizeReferralCode(code) : undefined },
    shouldAutoVerify: false,
  }
}

function reduceClearPendingVerification(prev: ReferralDomainState, id: number): ReferralDomainState {
  if (prev.pendingVerificationRequest?.id !== id) {
    return prev
  }

  return {
    ...prev,
    pendingVerificationRequest: undefined,
  }
}

export function useReferralContext(): ReferralContextValue {
  return useContext(ReferralContext)
}
