import { ReactNode, createContext, useCallback, useContext, useMemo, useState, Dispatch, SetStateAction } from 'react'

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
} from './referralReducers'
import { useReferralHydration, useReferralPersistence, useReferralStorageSync } from './referralStorage'

import { ReferralActions, ReferralContextValue, ReferralDomainState } from '../types'

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
  incomingCodeReason: undefined,
  previousVerification: undefined,
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
  setIncomingCodeReason: noop,
  setWalletState: noop,
  startVerification: noop,
  completeVerification: noop,
  setShouldAutoVerify: noop,
  setSavedCode: noop,
  requestVerification: noop,
  clearPendingVerification: noop,
  registerCancelVerification: noop,
}

const ReferralContext = createContext<ReferralContextValue>({
  ...initialState,
  cancelVerification: noop,
  actions: noopActions,
})

export function ReferralProvider({ children }: ReferralProviderProps): ReactNode {
  const value = useReferralStore()

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>
}

function useReferralStore(): ReferralContextValue {
  const [state, setState] = useState<ReferralDomainState>(initialState)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [cancelVerification, setCancelVerification] = useState<() => void>(() => () => undefined)

  useReferralHydration(setState, setHasHydrated)
  useReferralPersistence(state.savedCode, hasHydrated)
  useReferralStorageSync(setState)

  const actions = useReferralStoreActions(setState, setCancelVerification)

  return useMemo(
    () => ({
      ...state,
      cancelVerification,
      actions,
    }),
    [actions, cancelVerification, state],
  )
}

type SetReferralState = Dispatch<SetStateAction<ReferralDomainState>>

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

function useReferralStoreActions(
  setState: SetReferralState,
  setCancelVerification: Dispatch<SetStateAction<() => void>>,
): ReferralActions {
  const openModal = useStateReducerAction(setState, reduceOpenModal)
  const closeModal = useStateReducerAction(setState, reduceCloseModal)
  const setInputCode = useStateReducerAction(setState, reduceSetInputCode)
  const enableEditMode = useStateReducerAction(setState, reduceEnableEditMode)
  const disableEditMode = useStateReducerAction(setState, reduceDisableEditMode)
  const saveCode = useStateReducerAction(setState, reduceSaveCode)
  const removeCode = useStateReducerAction(setState, reduceRemoveCode)
  const setIncomingCode = useStateReducerAction(setState, reduceSetIncomingCode)
  const setIncomingCodeReason = useStateReducerAction(setState, reduceSetIncomingCodeReason)
  const setWalletState = useStateReducerAction(setState, reduceSetWalletState)
  const startVerification = useStateReducerAction(setState, reduceStartVerification)
  const completeVerification = useStateReducerAction(setState, reduceCompleteVerification)
  const setShouldAutoVerify = useStateReducerAction(setState, reduceSetShouldAutoVerify)
  const setSavedCode = useStateReducerAction(setState, reduceSetSavedCode)
  const requestVerification = useStateReducerAction(setState, reduceRequestVerification)
  const clearPendingVerification = useStateReducerAction(setState, reduceClearPendingVerification)
  const registerCancelVerification = useCallback(
    (handler: () => void) => {
      setCancelVerification(() => handler)
    },
    [setCancelVerification],
  )

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
      setIncomingCodeReason,
      setWalletState,
      startVerification,
      completeVerification,
      setShouldAutoVerify,
      setSavedCode,
      requestVerification,
      clearPendingVerification,
      registerCancelVerification,
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
      setIncomingCodeReason,
      setInputCode,
      registerCancelVerification,
      setSavedCode,
      setShouldAutoVerify,
      setWalletState,
      startVerification,
    ],
  )
}

export function useReferralContext(): ReferralContextValue {
  return useContext(ReferralContext)
}
