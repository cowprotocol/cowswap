import { FormEvent, RefObject, useCallback, useMemo, useRef } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'

import { Routes } from 'common/constants/routes'
import { NavigateFunction } from 'common/hooks/useNavigate'

import {
  computePrimaryCta,
  getStatusCopy,
  useReferralMessages,
  useReferralModalAnalytics,
  useReferralModalFocus,
} from './controller.helpers'
import { FocusableElement, PrimaryCta, ReferralModalContentProps } from './types'

import { isReferralCodeLengthValid } from '../../lib/affiliate-program-utils'
import { getIncomingIneligibleCode } from '../../lib/affiliate-program-utils'
import { useReferralActions } from '../../model/hooks/useReferralActions'
import { useReferralModalState } from '../../model/hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../model/types'

export interface ReferralModalControllerParams {
  modalState: ReturnType<typeof useReferralModalState>
  actions: ReturnType<typeof useReferralActions>
  account?: string
  supportedNetwork: boolean
  toggleWalletModal: () => void
  navigate: NavigateFunction
  analytics: CowAnalytics
}

export interface ReferralModalControllerResult {
  referral: ReturnType<typeof useReferralModalState>['referral']
  handleClose(): void
  initialFocusRef: RefObject<FocusableElement>
  contentProps: Omit<ReferralModalContentProps, 'onDismiss'>
}

// eslint-disable-next-line complexity
export function useReferralModalController(params: ReferralModalControllerParams): ReferralModalControllerResult {
  const { modalState, actions, account, supportedNetwork, toggleWalletModal, navigate, analytics } = params
  const { referral, uiState, displayCode, savedCode, hasCode, hasValidLength, verification, incomingCode, wallet } =
    modalState

  const inputRef = useRef<HTMLInputElement | null>(null)
  const ctaRef = useRef<HTMLButtonElement | null>(null)
  const effectiveWalletStatus = supportedNetwork ? wallet.status : 'unsupported'

  const primaryCta = useMemo(
    () =>
      computePrimaryCta({
        uiState,
        hasValidLength,
        hasCode,
        verification,
        verificationKind: verification.kind,
        walletStatus: effectiveWalletStatus,
      }),
    [effectiveWalletStatus, hasCode, hasValidLength, uiState, verification],
  )

  useReferralModalFocus(referral.modalOpen, uiState, inputRef, ctaRef)
  useReferralModalAnalytics(referral, uiState, analytics)

  const handlers = useReferralModalHandlers({
    actions,
    analytics,
    account,
    displayCode,
    primaryCta,
    toggleWalletModal,
    navigate,
    inputRef,
    cancelVerification: referral.cancelVerification,
    verificationKind: verification.kind,
    pendingVerificationId: referral.pendingVerificationRequest?.id,
  })

  const timeCapDays = verification.kind === 'valid' ? verification.programParams?.timeCapDays : undefined
  const statusCopy = getStatusCopy(verification, timeCapDays)
  const verificationCode = 'code' in verification ? verification.code : undefined
  const codeForDisplay = incomingCode || verificationCode || savedCode || displayCode
  const incomingIneligibleCode = getIncomingIneligibleCode(incomingCode, verification)
  const { linkedMessage } = useReferralMessages(codeForDisplay, referral.incomingCodeReason)
  const hasRejection = Boolean(referral.incomingCodeReason)

  const initialFocusRef =
    uiState === 'valid' || uiState === 'linked' || uiState === 'ineligible'
      ? (ctaRef as RefObject<FocusableElement>)
      : (inputRef as RefObject<FocusableElement>)

  return {
    referral,
    handleClose: handlers.onClose,
    initialFocusRef,
    contentProps: {
      uiState,
      savedCode,
      displayCode,
      verification,
      incomingIneligibleCode,
      onPrimaryClick: handlers.onPrimaryClick,
      onEdit: handlers.onEdit,
      onRemove: handlers.onRemove,
      onSave: handlers.onSave,
      onChange: handlers.onChange,
      primaryCta,
      linkedMessage,
      hasRejection,
      infoMessage: statusCopy.infoMessage,
      shouldShowInfo: statusCopy.shouldShowInfo,
      inputRef,
      ctaRef,
    },
  }
}

interface ReferralModalHandlersParams {
  actions: ReturnType<typeof useReferralActions>
  analytics: CowAnalytics
  account?: string
  displayCode: string
  primaryCta: PrimaryCta
  toggleWalletModal: () => void
  navigate: NavigateFunction
  inputRef: RefObject<HTMLInputElement | null>
  cancelVerification: () => void
  verificationKind: ReferralVerificationStatus['kind']
  pendingVerificationId?: number
}

interface ReferralModalHandlers {
  onClose(): void
  onEdit(): void
  onRemove(): void
  onSave(): void
  onPrimaryClick(): void
  onChange(event: FormEvent<HTMLInputElement>): void
}

function useReferralModalHandlers(params: ReferralModalHandlersParams): ReferralModalHandlers {
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
  actions: ReturnType<typeof useReferralActions>
  cancelVerification: () => void
  pendingVerificationId?: number
  verificationKind: ReferralVerificationStatus['kind']
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
  actions: ReturnType<typeof useReferralActions>
  displayCode: string
  navigate: NavigateFunction
  onClose: () => void
}): () => void {
  const { primaryCta, account, toggleWalletModal, analytics, actions, displayCode, navigate, onClose } = params

  return useCallback(() => {
    if (primaryCta.disabled) {
      return
    }

    if (!account && primaryCta.action === 'verify') {
      toggleWalletModal()
      analytics.sendEvent({ category: 'referral', action: 'cta_clicked', label: 'connect_to_verify' })
      return
    }

    if (primaryCta.action === 'verify') {
      analytics.sendEvent({ category: 'referral', action: 'cta_clicked', label: 'connect_to_verify' })
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
    primaryCta.action,
    primaryCta.disabled,
    toggleWalletModal,
  ])
}
