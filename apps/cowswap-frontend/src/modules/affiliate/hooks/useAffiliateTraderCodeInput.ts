import { useAtomValue, useSetAtom } from 'jotai'
import {
  type Dispatch,
  type FormEvent,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAffiliateTraderCodeFromUrl } from './useAffiliateTraderCodeFromUrl'
import { useAffiliateTraderVerification, UseAffiliateTraderVerificationResult } from './useAffiliateTraderVerification'
import { TraderWalletStatus } from './useAffiliateTraderWallet'

import { AffiliateCodeSource } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { logAffiliate } from '../utils/logger'

interface UseAffiliateTraderCodeInputParams {
  requiresPayoutConfirmation: boolean
  walletStatus: TraderWalletStatus
}

export interface UseAffiliateTraderCodeInputResult extends UseAffiliateTraderVerificationResult {
  codeInput: string
  codeSource: AffiliateCodeSource
  error?: string
  onChange(event: FormEvent<HTMLInputElement>): void
  onEdit(): void
  onRemove(): void
}

function resetTraderCodeInputState(
  setCodeSource: Dispatch<SetStateAction<AffiliateCodeSource>>,
  setError: Dispatch<SetStateAction<string | undefined>>,
  shouldAutoVerify: MutableRefObject<boolean>,
): void {
  setCodeSource(AffiliateCodeSource.MANUAL_INPUT)
  setError(undefined)
  shouldAutoVerify.current = false
}

function trackTraderCodeMutation(
  analytics: ReturnType<typeof useCowAnalytics>,
  action: 'affiliate_trader_code_input_edited' | 'affiliate_trader_code_removed',
  previousCodeSource: AffiliateCodeSource | undefined,
  isLinked: boolean | undefined,
): void {
  trackAffiliateEvent({
    analytics,
    action,
    previousCodeSource,
    wasLinked: !!isLinked,
  })
}

export function useAffiliateTraderCodeInput({
  requiresPayoutConfirmation,
  walletStatus,
}: UseAffiliateTraderCodeInputParams): UseAffiliateTraderCodeInputResult {
  const { account } = useWalletInfo()
  const analytics = useCowAnalytics()
  const { savedCode, isLinked, source: savedCodeSource } = useAtomValue(affiliateTraderSavedCodeAtom)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)

  const [codeInput, setCodeInput] = useState<string>(savedCode ?? '')
  const [codeSource, setCodeSource] = useState<AffiliateCodeSource>(savedCodeSource ?? AffiliateCodeSource.MANUAL_INPUT)
  const [error, setError] = useState<string | undefined>(undefined)
  const { isVerifying, verifyCode } = useAffiliateTraderVerification({
    requiresPayoutConfirmation,
    setError,
    walletStatus,
  })

  const shouldAutoVerify = useRef(false)
  const onRecoveredFromUrl = useCallback(
    (refCode: string): void => {
      logAffiliate('Recovered referral code from URL', { refCode })
      if (isLinked) return
      setCodeInput(refCode)
      setCodeSource(AffiliateCodeSource.URL_REF_PARAM)
      setError(undefined)
      shouldAutoVerify.current = true
    },
    [setError, isLinked],
  )
  useAffiliateTraderCodeFromUrl(onRecoveredFromUrl)

  useEffect(() => {
    if (shouldAutoVerify.current && !!account) {
      shouldAutoVerify.current = false
      void verifyCode({ code: codeInput, account, codeSource })
    }
  }, [account, codeInput, codeSource, verifyCode])

  const onChange = useCallback(
    (event: FormEvent<HTMLInputElement>): void => {
      setCodeInput(event.currentTarget.value.trim().toUpperCase())
      resetTraderCodeInputState(setCodeSource, setError, shouldAutoVerify)
    },
    [setError],
  )

  const onEdit = useCallback((): void => {
    trackTraderCodeMutation(analytics, 'affiliate_trader_code_input_edited', savedCodeSource, isLinked)
    setSavedCode(undefined)
    setCodeInput(savedCode ?? '')
    resetTraderCodeInputState(setCodeSource, setError, shouldAutoVerify)
  }, [analytics, isLinked, savedCode, savedCodeSource, setError, setSavedCode])

  const onRemove = useCallback((): void => {
    trackTraderCodeMutation(analytics, 'affiliate_trader_code_removed', savedCodeSource, isLinked)
    setSavedCode(undefined)
    setCodeInput('')
    resetTraderCodeInputState(setCodeSource, setError, shouldAutoVerify)
  }, [analytics, isLinked, savedCodeSource, setError, setSavedCode])

  return useMemo(
    () => ({
      codeInput,
      codeSource,
      error,
      isVerifying,
      verifyCode,
      onChange,
      onEdit,
      onRemove,
    }),
    [codeInput, codeSource, error, isVerifying, verifyCode, onChange, onEdit, onRemove],
  )
}
