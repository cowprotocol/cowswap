import { useAtomValue } from 'jotai'
import { FormEvent, RefObject, useCallback, useMemo, useRef } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'

import { ordersFromApiStatusAtom } from 'modules/orders/state/ordersFromApiStatusAtom'

import { Routes } from 'common/constants/routes'
import { NavigateFunction } from 'common/hooks/useNavigate'

import {
  computePrimaryCta,
  getStatusCopy,
  useTraderReferralCodeModalAnalytics,
  useTraderReferralCodeModalFocus,
} from './traderReferralCodeModal.helpers'
import { FocusableElement, PrimaryCta, TraderReferralCodeModalContentProps } from './TraderReferralCodeModal.types'

import { useTraderReferralCodeActions } from '../../hooks/useTraderReferralCodeActions'
import { useTraderReferralCodeModalState } from '../../hooks/useTraderReferralCodeModalState'
import { TraderReferralCodeVerificationStatus } from '../../lib/affiliateProgramTypes'
import { isReferralCodeLengthValid, getIncomingIneligibleCode } from '../../lib/affiliateProgramUtils'

export interface TraderReferralCodeModalControllerParams {
  modalState: ReturnType<typeof useTraderReferralCodeModalState>
  actions: ReturnType<typeof useTraderReferralCodeActions>
  account?: string
  supportedNetwork: boolean
  toggleWalletModal: () => void
  navigate: NavigateFunction
  analytics: CowAnalytics
}

export interface TraderReferralCodeModalControllerResult {
  traderReferralCode: ReturnType<typeof useTraderReferralCodeModalState>['traderReferralCode']
  handleClose(): void
  initialFocusRef: RefObject<FocusableElement>
  contentProps: Omit<TraderReferralCodeModalContentProps, 'onDismiss'>
}

// eslint-disable-next-line complexity, max-lines-per-function
export function useTraderReferralCodeModalController(
  params: TraderReferralCodeModalControllerParams,
): TraderReferralCodeModalControllerResult {
  const { modalState, actions, account, supportedNetwork, toggleWalletModal, navigate, analytics } = params
  const ordersFromApiStatus = useAtomValue(ordersFromApiStatusAtom)
  const {
    traderReferralCode,
    uiState,
    displayCode,
    savedCode,
    hasCode,
    hasValidLength,
    verification,
    incomingCode,
    wallet,
  } = modalState

  const inputRef = useRef<HTMLInputElement | null>(null)
  const ctaRef = useRef<HTMLButtonElement | null>(null)
  const effectiveWalletStatus = supportedNetwork ? wallet.status : 'unsupported'

  const primaryCta = useMemo(
    () =>
      computePrimaryCta({
        uiState,
        hasValidLength,
        hasCode,
        verificationKind: verification.kind,
        walletStatus: effectiveWalletStatus,
      }),
    [effectiveWalletStatus, hasCode, hasValidLength, uiState, verification],
  )

  useTraderReferralCodeModalFocus(traderReferralCode.modalOpen, uiState, inputRef, ctaRef)
  useTraderReferralCodeModalAnalytics(traderReferralCode, uiState, analytics)

  const handlers = useTraderReferralCodeModalHandlers({
    actions,
    analytics,
    account,
    displayCode,
    primaryCta,
    toggleWalletModal,
    navigate,
    inputRef,
    cancelVerification: traderReferralCode.cancelVerification,
    verificationKind: verification.kind,
    pendingVerificationId: traderReferralCode.pendingVerificationRequest?.id,
  })

  const timeCapDays = verification.kind === 'valid' ? verification.programParams?.timeCapDays : undefined
  const eligibilityUnknown = traderReferralCode.wallet.status === 'eligibility-unknown'
  const eligibilityConfirmed = ordersFromApiStatus === 'success'
  let statusCopy = getStatusCopy(verification, timeCapDays, eligibilityUnknown)
  if (!eligibilityUnknown && !eligibilityConfirmed) {
    statusCopy = { ...statusCopy, shouldShowInfo: false }
  }
  const verificationCode = 'code' in verification ? verification.code : undefined
  const codeForDisplay = incomingCode || verificationCode || savedCode || displayCode
  const incomingIneligibleCode = getIncomingIneligibleCode(incomingCode, verification)
  const hasRejection = Boolean(traderReferralCode.incomingCodeReason)
  const rejectionCode = hasRejection ? codeForDisplay : undefined

  const initialFocusRef =
    uiState === 'valid' || uiState === 'linked' || uiState === 'ineligible'
      ? (ctaRef as RefObject<FocusableElement>)
      : (inputRef as RefObject<FocusableElement>)

  return {
    traderReferralCode,
    handleClose: handlers.onClose,
    initialFocusRef,
    contentProps: {
      uiState,
      isConnected: Boolean(account),
      savedCode,
      displayCode,
      verification,
      incomingIneligibleCode,
      rejectionCode,
      rejectionReason: traderReferralCode.incomingCodeReason,
      isLinked: uiState === 'linked',
      onPrimaryClick: handlers.onPrimaryClick,
      onEdit: handlers.onEdit,
      onRemove: handlers.onRemove,
      onSave: handlers.onSave,
      onChange: handlers.onChange,
      primaryCta,
      hasRejection,
      infoMessage: statusCopy.infoMessage,
      shouldShowInfo: statusCopy.shouldShowInfo,
      infoVariant: statusCopy.variant,
      inputRef,
      ctaRef,
    },
  }
}

interface TraderReferralCodeModalHandlersParams {
  actions: ReturnType<typeof useTraderReferralCodeActions>
  analytics: CowAnalytics
  account?: string
  displayCode: string
  primaryCta: PrimaryCta
  toggleWalletModal: () => void
  navigate: NavigateFunction
  inputRef: RefObject<HTMLInputElement | null>
  cancelVerification: () => void
  verificationKind: TraderReferralCodeVerificationStatus['kind']
  pendingVerificationId?: number
}

interface TraderReferralCodeModalHandlers {
  onClose(): void
  onEdit(): void
  onRemove(): void
  onSave(): void
  onPrimaryClick(): void
  onChange(event: FormEvent<HTMLInputElement>): void
}

function useTraderReferralCodeModalHandlers(
  params: TraderReferralCodeModalHandlersParams,
): TraderReferralCodeModalHandlers {
  const {
    actions,
    analytics,
    account,
    displayCode,
    primaryCta,
    toggleWalletModal,
    navigate,
    inputRef,
    cancelVerification,
    verificationKind,
    pendingVerificationId,
  } = params

  const focusInput = useFocusInputRef(inputRef)
  const cancelInFlightVerification = useCancelVerificationHandler({
    actions,
    cancelVerification,
    pendingVerificationId,
    verificationKind,
  })

  const onClose = useCallback(() => {
    cancelInFlightVerification()
    actions.disableEditMode()
    actions.closeModal()
  }, [actions, cancelInFlightVerification])

  const onEdit = useCallback(() => {
    cancelInFlightVerification()
    actions.enableEditMode()
    focusInput()
  }, [actions, cancelInFlightVerification, focusInput])

  const onRemove = useCallback(() => {
    cancelInFlightVerification()
    actions.removeCode()
    focusInput()
  }, [actions, cancelInFlightVerification, focusInput])

  const onSave = useCallback(() => {
    if (!displayCode || !isReferralCodeLengthValid(displayCode)) {
      return
    }

    cancelInFlightVerification()
    actions.saveCode(displayCode)
    analytics.sendEvent({
      category: 'referral',
      action: 'code_saved',
      label: 'manual',
      value: displayCode.length,
    })
  }, [actions, analytics, cancelInFlightVerification, displayCode])

  const onPrimaryClick = usePrimaryClickHandler({
    primaryCta,
    account,
    toggleWalletModal,
    analytics,
    actions,
    displayCode,
    navigate,
    onClose,
    onSave,
  })

  const onChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      actions.setInputCode(event.currentTarget.value)
    },
    [actions],
  )

  return {
    onClose,
    onEdit,
    onRemove,
    onSave,
    onPrimaryClick,
    onChange,
  }
}

function useFocusInputRef(inputRef: RefObject<HTMLInputElement | null>): () => void {
  return useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [inputRef])
}

function useCancelVerificationHandler(params: {
  actions: ReturnType<typeof useTraderReferralCodeActions>
  cancelVerification: () => void
  pendingVerificationId?: number
  verificationKind: TraderReferralCodeVerificationStatus['kind']
}): () => void {
  const { actions, cancelVerification, pendingVerificationId, verificationKind } = params

  return useCallback(() => {
    cancelVerification()
    actions.setShouldAutoVerify(false)

    if (pendingVerificationId !== undefined) {
      actions.clearPendingVerification(pendingVerificationId)
    }

    if (verificationKind === 'checking') {
      actions.completeVerification({ kind: 'idle' })
    }

    actions.setIncomingCodeReason(undefined)
  }, [actions, cancelVerification, pendingVerificationId, verificationKind])
}

function usePrimaryClickHandler(params: {
  primaryCta: PrimaryCta
  account?: string
  toggleWalletModal: () => void
  analytics: CowAnalytics
  actions: ReturnType<typeof useTraderReferralCodeActions>
  displayCode: string
  navigate: NavigateFunction
  onClose: () => void
  onSave: () => void
}): () => void {
  const { primaryCta, account, toggleWalletModal, analytics, actions, displayCode, navigate, onClose, onSave } = params

  return useCallback(() => {
    if (primaryCta.disabled) {
      return
    }

    if (!account && primaryCta.action === 'verify') {
      toggleWalletModal()
      analytics.sendEvent({ category: 'referral', action: 'cta_clicked', label: 'connect_to_verify' })
      return
    }

    if (primaryCta.action === 'save') {
      onSave()
      return
    }

    if (primaryCta.action === 'verify') {
      analytics.sendEvent({ category: 'referral', action: 'cta_clicked', label: 'verify_code' })
      actions.requestVerification(displayCode)
      return
    }

    if (primaryCta.action === 'viewRewards') {
      analytics.sendEvent({ category: 'referral', action: 'cta_clicked', label: 'view_rewards' })
      onClose()
      navigate(Routes.ACCOUNT_MY_REWARDS)
      return
    }

    if (primaryCta.action === 'goBack') {
      analytics.sendEvent({ category: 'referral', action: 'cta_clicked', label: 'go_back' })
      onClose()
    }
  }, [
    account,
    actions,
    analytics,
    displayCode,
    navigate,
    onClose,
    onSave,
    primaryCta.action,
    primaryCta.disabled,
    toggleWalletModal,
  ])
}
