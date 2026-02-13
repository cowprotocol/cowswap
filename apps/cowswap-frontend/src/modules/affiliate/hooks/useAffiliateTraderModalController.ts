import { useAtom, useSetAtom } from 'jotai'
import { FormEvent, RefObject, useCallback, useMemo, useRef } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Routes } from 'common/constants/routes'
import { NavigateFunction } from 'common/hooks/useNavigate'

import { AffiliateTraderModalState } from './useAffiliateTraderModalState'
import { TraderWalletStatus } from './useAffiliateTraderWallet'

import { TraderReferralCodeVerificationStatus } from '../lib/affiliateProgramTypes'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import {
  FocusableElement,
  PrimaryCta,
  TraderReferralCodeModalContentProps,
} from '../pure/AffiliateTraderModal/AffiliateTraderModal.types'
import {
  buildAffiliateTraderModalViewModel,
  buildFormViewModel,
} from '../pure/AffiliateTraderModal/buildAffiliateTraderModalViewModel'
import {
  computePrimaryCta,
  useTraderReferralCodeModalAnalytics,
  useTraderReferralCodeModalFocus,
} from '../pure/AffiliateTraderModal/traderReferralCodeModal.helpers'
import { payoutAddressConfirmationAtom } from '../state/affiliateTraderAtom'
import {
  closeTraderReferralCodeModalAtom,
  completeTraderReferralVerificationAtom,
  disableTraderReferralCodeEditModeAtom,
  enableTraderReferralCodeEditModeAtom,
  removeTraderReferralCodeAtom,
  saveTraderReferralCodeAtom,
  setTraderReferralCodeInputAtom,
  setTraderReferralIncomingCodeReasonAtom,
} from '../state/affiliateTraderWriteAtoms'

export interface TraderReferralCodeModalControllerParams {
  modalState: AffiliateTraderModalState
  account?: string
  chainId?: number
  supportedNetwork: boolean
  toggleWalletModal: () => void
  navigate: NavigateFunction
  analytics: CowAnalytics
  runVerification(code: string): Promise<void>
  cancelVerification(): void
}

export interface AffiliateTraderModalControllerResult {
  modalState: AffiliateTraderModalState
  handleClose(): void
  initialFocusRef: RefObject<FocusableElement>
  contentProps: Omit<TraderReferralCodeModalContentProps, 'onDismiss'>
}

export function useAffiliateTraderModalController(
  params: TraderReferralCodeModalControllerParams,
): AffiliateTraderModalControllerResult {
  const {
    modalState,
    account,
    chainId,
    supportedNetwork,
    toggleWalletModal,
    navigate,
    analytics,
    runVerification,
    cancelVerification,
  } = params
  const { uiState, displayCode, hasCode, hasValidLength, walletStatus, verification, savedCode } = modalState

  const inputRef = useRef<HTMLInputElement | null>(null)
  const ctaRef = useRef<HTMLButtonElement | null>(null)
  const { payoutAddressConfirmed, togglePayoutAddressConfirmed } = usePayoutAddressConfirmation(account)
  const effectiveWalletStatus = supportedNetwork ? walletStatus : TraderWalletStatus.UNSUPPORTED
  const effectivePrimaryCta = useEffectivePrimaryCta({
    uiState,
    hasValidLength,
    hasCode,
    verificationKind: verification.kind,
    walletStatus: effectiveWalletStatus,
    account,
    chainId,
    payoutAddressConfirmed,
  })

  useTraderReferralCodeModalFocus(modalState.modalOpen, uiState, inputRef, ctaRef)
  useTraderReferralCodeModalAnalytics(modalState, uiState, analytics)

  const handlers = useTraderReferralCodeModalHandlers({
    analytics,
    account,
    displayCode,
    primaryCta: effectivePrimaryCta,
    toggleWalletModal,
    navigate,
    inputRef,
    verificationKind: verification.kind,
    runVerification,
    cancelVerification,
  })
  const initialFocusRef =
    uiState === 'valid' || uiState === 'linked' || uiState === 'ineligible'
      ? (ctaRef as RefObject<FocusableElement>)
      : (inputRef as RefObject<FocusableElement>)
  const contentProps = useContentProps({
    modalState,
    account,
    chainId,
    payoutAddressConfirmed,
    togglePayoutAddressConfirmed,
    uiState,
    savedCode,
    displayCode,
    verification,
    handlers,
    effectivePrimaryCta,
    inputRef,
    ctaRef,
  })

  return {
    modalState,
    handleClose: handlers.onClose,
    initialFocusRef,
    contentProps,
  }
}

function usePayoutAddressConfirmation(account?: string): {
  payoutAddressConfirmed: boolean
  togglePayoutAddressConfirmed(checked: boolean): void
} {
  const [payoutAddressConfirmationByWallet, setPayoutAddressConfirmationByWallet] =
    useAtom(payoutAddressConfirmationAtom)
  const normalizedAccount = account?.toLowerCase()
  const payoutAddressConfirmed = normalizedAccount ? !!payoutAddressConfirmationByWallet[normalizedAccount] : false

  const togglePayoutAddressConfirmed = useCallback(
    (checked: boolean) => {
      if (!normalizedAccount) return
      setPayoutAddressConfirmationByWallet((prev) => ({ ...prev, [normalizedAccount]: checked }))
    },
    [normalizedAccount, setPayoutAddressConfirmationByWallet],
  )

  return { payoutAddressConfirmed, togglePayoutAddressConfirmed }
}

function useEffectivePrimaryCta(params: {
  uiState: AffiliateTraderModalState['uiState']
  hasValidLength: boolean
  hasCode: boolean
  verificationKind: TraderReferralCodeVerificationStatus['kind']
  walletStatus: TraderWalletStatus
  account?: string
  chainId?: number
  payoutAddressConfirmed: boolean
}): PrimaryCta {
  const { uiState, hasValidLength, hasCode, verificationKind, walletStatus, account, chainId, payoutAddressConfirmed } =
    params
  const primaryCta = useMemo(
    () => computePrimaryCta({ uiState, hasValidLength, hasCode, verificationKind, walletStatus }),
    [hasCode, hasValidLength, uiState, verificationKind, walletStatus],
  )
  const blockedByPayoutConfirmation =
    Boolean(account) &&
    chainId !== undefined &&
    chainId !== SupportedChainId.MAINNET &&
    !payoutAddressConfirmed &&
    ['save', 'verify'].includes(primaryCta.action)

  return useMemo(
    () => (blockedByPayoutConfirmation ? { ...primaryCta, disabled: true } : primaryCta),
    [blockedByPayoutConfirmation, primaryCta],
  )
}

function useContentProps(params: {
  modalState: AffiliateTraderModalState
  account?: string
  chainId?: number
  payoutAddressConfirmed: boolean
  togglePayoutAddressConfirmed(checked: boolean): void
  uiState: AffiliateTraderModalState['uiState']
  savedCode?: string
  displayCode: string
  verification: AffiliateTraderModalState['verification']
  handlers: TraderReferralCodeModalHandlers
  effectivePrimaryCta: PrimaryCta
  inputRef: RefObject<HTMLInputElement | null>
  ctaRef: RefObject<HTMLButtonElement | null>
}): Omit<TraderReferralCodeModalContentProps, 'onDismiss'> {
  const {
    modalState,
    account,
    chainId,
    payoutAddressConfirmed,
    togglePayoutAddressConfirmed,
    uiState,
    savedCode,
    displayCode,
    verification,
    handlers,
    effectivePrimaryCta,
    inputRef,
    ctaRef,
  } = params

  return useMemo(() => {
    const viewModel = buildAffiliateTraderModalViewModel({
      modalState,
      account,
      chainId,
      payoutAddressConfirmed,
      onTogglePayoutAddressConfirmed: togglePayoutAddressConfirmed,
    })

    return {
      ...viewModel,
      uiState,
      form: {
        ...buildFormViewModel({
          uiState,
          isConnected: Boolean(account),
          savedCode,
          displayCode,
          verification,
          onEdit: handlers.onEdit,
          onRemove: handlers.onRemove,
          onSave: handlers.onSave,
          onChange: handlers.onChange,
        }),
        inputRef,
      },
      primaryCta: effectivePrimaryCta,
      onPrimaryClick: handlers.onPrimaryClick,
      ctaRef,
    }
  }, [
    account,
    chainId,
    ctaRef,
    displayCode,
    effectivePrimaryCta,
    handlers.onChange,
    handlers.onEdit,
    handlers.onPrimaryClick,
    handlers.onRemove,
    handlers.onSave,
    inputRef,
    modalState,
    payoutAddressConfirmed,
    savedCode,
    togglePayoutAddressConfirmed,
    uiState,
    verification,
  ])
}

interface TraderReferralCodeModalHandlersParams {
  analytics: CowAnalytics
  account?: string
  displayCode: string
  primaryCta: PrimaryCta
  toggleWalletModal: () => void
  navigate: NavigateFunction
  inputRef: RefObject<HTMLInputElement | null>
  verificationKind: TraderReferralCodeVerificationStatus['kind']
  runVerification(code: string): Promise<void>
  cancelVerification(): void
}

interface TraderReferralCodeModalHandlers {
  onClose(): void
  onEdit(): void
  onRemove(): void
  onSave(): void
  onPrimaryClick(): void
  onChange(event: FormEvent<HTMLInputElement>): void
}

// eslint-disable-next-line max-lines-per-function
function useTraderReferralCodeModalHandlers(
  params: TraderReferralCodeModalHandlersParams,
): TraderReferralCodeModalHandlers {
  const {
    analytics,
    account,
    displayCode,
    primaryCta,
    toggleWalletModal,
    navigate,
    inputRef,
    verificationKind,
    runVerification,
    cancelVerification,
  } = params
  const closeModal = useSetAtom(closeTraderReferralCodeModalAtom)
  const setInputCode = useSetAtom(setTraderReferralCodeInputAtom)
  const enableEditMode = useSetAtom(enableTraderReferralCodeEditModeAtom)
  const disableEditMode = useSetAtom(disableTraderReferralCodeEditModeAtom)
  const saveCode = useSetAtom(saveTraderReferralCodeAtom)
  const removeCode = useSetAtom(removeTraderReferralCodeAtom)
  const completeVerification = useSetAtom(completeTraderReferralVerificationAtom)
  const setIncomingCodeReason = useSetAtom(setTraderReferralIncomingCodeReasonAtom)

  const cancelInFlightVerification = useCallback(() => {
    cancelVerification()

    if (verificationKind === 'checking') {
      completeVerification({ kind: 'idle' })
    }

    setIncomingCodeReason(undefined)
  }, [cancelVerification, completeVerification, setIncomingCodeReason, verificationKind])

  const onClose = useCallback(() => {
    cancelInFlightVerification()
    disableEditMode()
    closeModal()
  }, [cancelInFlightVerification, closeModal, disableEditMode])

  const onEdit = useCallback(() => {
    cancelInFlightVerification()
    enableEditMode()
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [cancelInFlightVerification, enableEditMode, inputRef])

  const onRemove = useCallback(() => {
    cancelInFlightVerification()
    removeCode()
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [cancelInFlightVerification, inputRef, removeCode])

  const onSave = useCallback(() => {
    const refCode = displayCode ? formatRefCode(displayCode) : undefined

    if (!refCode) {
      return
    }

    cancelInFlightVerification()
    saveCode(displayCode)
    analytics.sendEvent({
      category: 'affiliate',
      action: 'code_saved_manually',
      label: refCode,
    })
  }, [analytics, cancelInFlightVerification, displayCode, saveCode])

  const onPrimaryClick = useCallback(() => {
    if (primaryCta.disabled) {
      return
    }

    if (!account && primaryCta.action === 'verify') {
      toggleWalletModal()
      analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'connect_to_verify' })
      return
    }

    if (primaryCta.action === 'save') {
      onSave()
      return
    }

    if (primaryCta.action === 'verify') {
      cancelInFlightVerification()
      analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'verify_code' })
      runVerification(displayCode)
      return
    }

    if (primaryCta.action === 'viewRewards') {
      analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'view_rewards' })
      onClose()
      navigate(Routes.ACCOUNT_MY_REWARDS)
      return
    }

    if (primaryCta.action === 'goBack') {
      analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'go_back' })
      onClose()
    }
  }, [
    account,
    analytics,
    displayCode,
    navigate,
    onClose,
    onSave,
    primaryCta.action,
    primaryCta.disabled,
    runVerification,
    toggleWalletModal,
    cancelInFlightVerification,
  ])

  const onChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      setInputCode(event.currentTarget.value)
    },
    [setInputCode],
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
