import { useAtomValue, useSetAtom } from 'jotai'
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAffiliateTraderCodeFromUrl } from './useAffiliateTraderCodeFromUrl'
import { useAffiliateTraderVerification, UseAffiliateTraderVerificationResult } from './useAffiliateTraderVerification'

import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { logAffiliate } from '../utils/logger'

export interface UseAffiliateTraderCodeInputResult extends UseAffiliateTraderVerificationResult {
  codeInput: string
  error?: string
  onChange(event: FormEvent<HTMLInputElement>): void
  onEdit(): void
  onRemove(): void
}

export function useAffiliateTraderCodeInput(): UseAffiliateTraderCodeInputResult {
  const { account } = useWalletInfo()
  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)

  const [codeInput, setCodeInput] = useState<string>(savedCode ?? '')
  const [error, setError] = useState<string | undefined>(undefined)
  const { isVerifying, verifyCode } = useAffiliateTraderVerification({ setError })

  const shouldAutoVerify = useRef(false)
  const onRecoveredFromUrl = useCallback(
    (refCode: string): void => {
      logAffiliate('Recovered referral code from URL', { refCode })
      if (isLinked) return
      setCodeInput(refCode)
      setError(undefined)
      shouldAutoVerify.current = true
    },
    [setError, isLinked],
  )
  useAffiliateTraderCodeFromUrl(onRecoveredFromUrl)

  useEffect(() => {
    if (shouldAutoVerify.current && !!account) {
      shouldAutoVerify.current = false
      verifyCode(codeInput, account)
    }
  }, [account, codeInput, verifyCode])

  const onChange = useCallback(
    (event: FormEvent<HTMLInputElement>): void => {
      setCodeInput(event.currentTarget.value.trim().toUpperCase())
      setError(undefined)
      shouldAutoVerify.current = false
    },
    [setError],
  )

  const onEdit = useCallback((): void => {
    setSavedCode(undefined)
    setCodeInput(savedCode ?? '')
    setError(undefined)
    shouldAutoVerify.current = false
  }, [savedCode, setError, setSavedCode])

  const onRemove = useCallback((): void => {
    setSavedCode(undefined)
    setCodeInput('')
    setError(undefined)
    shouldAutoVerify.current = false
  }, [setError, setSavedCode])

  return {
    codeInput,
    error,
    isVerifying,
    verifyCode,
    onChange,
    onEdit,
    onRemove,
  }
}
