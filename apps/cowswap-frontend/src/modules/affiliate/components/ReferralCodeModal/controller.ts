import { FormEvent, RefObject, useCallback, useMemo, useRef } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'

import { Routes } from 'common/constants/routes'
import { NavigateFunction } from 'common/hooks/useNavigate'

import {
  computePrimaryCta,
  getHelperText,
  getStatusCopy,
  useReferralMessages,
  useReferralModalAnalytics,
  useReferralModalFocus,
} from './controller.helpers'
import { FocusableElement, PrimaryCta, ReferralModalContentProps } from './types'

import { useReferralActions } from '../../hooks/useReferralActions'
import { useReferralModalState } from '../../hooks/useReferralModalState'
import { isReferralCodeLengthValid } from '../../utils/code'

export interface ReferralModalControllerParams {
  modalState: ReturnType<typeof useReferralModalState>
  actions: ReturnType<typeof useReferralActions>
  account?: string
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

export function useReferralModalController(params: ReferralModalControllerParams): ReferralModalControllerResult {
  const { modalState, actions, account, toggleWalletModal, navigate, analytics } = params
  const { referral, uiState, displayCode, savedCode, hasCode, hasValidLength, verification, incomingCode } = modalState

  const inputRef = useRef<HTMLInputElement | null>(null)
  const ctaRef = useRef<HTMLButtonElement | null>(null)

  const primaryCta = useMemo(
    () => computePrimaryCta({ uiState, hasValidLength, hasCode, verificationKind: verification.kind }),
    [hasCode, hasValidLength, uiState, verification.kind],
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
  })

  const helperText = getHelperText(uiState)
  const statusCopy = getStatusCopy(verification)
  const verificationCode = 'code' in verification ? verification.code : undefined
  const codeForDisplay = incomingCode || verificationCode || savedCode || displayCode
  const { linkedMessage, ineligibleMessage } = useReferralMessages(codeForDisplay)

  const initialFocusRef =
    uiState === 'valid' || uiState === 'linked'
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
      onPrimaryClick: handlers.onPrimaryClick,
      onEdit: handlers.onEdit,
      onRemove: handlers.onRemove,
      onSave: handlers.onSave,
      onChange: handlers.onChange,
      helperText,
      primaryCta,
      errorMessage: statusCopy.errorMessage,
      invalidMessage: statusCopy.invalidMessage,
      expiredMessage: statusCopy.expiredMessage,
      linkedMessage,
      ineligibleMessage,
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
  const { actions, analytics, account, displayCode, primaryCta, toggleWalletModal, navigate, inputRef } = params

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [inputRef])

  const onClose = useCallback(() => {
    actions.disableEditMode()
    actions.closeModal()
  }, [actions])

  const onEdit = useCallback(() => {
    actions.enableEditMode()
    focusInput()
  }, [actions, focusInput])

  const onRemove = useCallback(() => {
    actions.removeCode()
    focusInput()
  }, [actions, focusInput])

  const onSave = useCallback(() => {
    if (!displayCode || !isReferralCodeLengthValid(displayCode)) {
      return
    }

    actions.saveCode(displayCode)
    analytics.sendEvent({
      category: 'referral',
      action: 'code_saved',
      label: 'manual',
      value: displayCode.length,
    })
  }, [actions, analytics, displayCode])

  const onPrimaryClick = useCallback(() => {
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
      navigate(Routes.ACCOUNT)
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
