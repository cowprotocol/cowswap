import { useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ApiError } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

import { safeShortenAddress } from 'utils/address'

import { AffiliateVerificationResult } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import { setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { logAffiliate } from '../utils/logger'

export interface UseAffiliateTraderVerificationResult {
  isVerifying: boolean
  verifyCode(code: string, account: string): Promise<void>
}

interface VerificationParams {
  setError(error?: string): void
}

function trackTraderVerificationCompleted(
  analytics: ReturnType<typeof useCowAnalytics>,
  verificationResult: AffiliateVerificationResult,
): void {
  trackAffiliateEvent({
    analytics,
    action: 'affiliate_trader_code_verification_completed',
    verificationResult,
  })
}

async function verifyTraderAffiliateCode(
  analytics: ReturnType<typeof useCowAnalytics>,
  account: string,
  code: string,
  setError: (error?: string) => void,
  setSavedCode: (value: { savedCode: string; isLinked: boolean }) => void,
): Promise<void> {
  const formattedCode = formatRefCode(code)

  trackAffiliateEvent({
    analytics,
    action: 'affiliate_trader_code_verification_started',
  })
  setError(undefined)

  if (!formattedCode) {
    logAffiliate(safeShortenAddress(account), 'Code verification failed: invalid referral code format')
    setError(t`Only A-Z, 0-9, dashes, and underscores are allowed.`)
    trackTraderVerificationCompleted(analytics, AffiliateVerificationResult.INVALID_FORMAT)
    return
  }

  try {
    await bffAffiliateApi.verifyCode(formattedCode)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      logAffiliate(safeShortenAddress(account), 'Code verification failed: invalid referral code')
      setError(t`This code is invalid. Try another.`)
      trackTraderVerificationCompleted(analytics, AffiliateVerificationResult.INVALID_CODE)
      return
    }

    throw error
  }

  const partnerInfo = await bffAffiliateApi.getPartnerInfo(account)
  if (partnerInfo?.code === formattedCode) {
    logAffiliate(safeShortenAddress(account), 'Code verification failed: self-referral')
    setError(t`You cannot apply your own referral code.`)
    trackTraderVerificationCompleted(analytics, AffiliateVerificationResult.SELF_REFERRAL)
    return
  }

  logAffiliate(safeShortenAddress(account), 'Trader verification succeeded')

  setSavedCode({ savedCode: formattedCode, isLinked: false })
  setError(undefined)
  trackTraderVerificationCompleted(analytics, AffiliateVerificationResult.SUCCESS)
}

interface VerificationParams {
  setError(error?: string): void
}

export function useAffiliateTraderVerification(params: VerificationParams): UseAffiliateTraderVerificationResult {
  const { setError } = params
  const analytics = useCowAnalytics()
  const [isVerifying, setIsVerifying] = useState(false)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)

  const verifyCode = useCallback(
    async (code: string, account: string): Promise<void> => {
      setIsVerifying(true)

      try {
        await verifyTraderAffiliateCode(analytics, account, code, setError, setSavedCode)
      } catch (error) {
        setError(t`Affiliate service is unreachable. Try again later.`)
        logAffiliate(safeShortenAddress(account), `Code verification failed`, error)
        trackTraderVerificationCompleted(analytics, AffiliateVerificationResult.SERVICE_UNAVAILABLE)
      } finally {
        setIsVerifying(false)
      }
    },
    [analytics, setError, setSavedCode],
  )

  return useMemo(() => ({ isVerifying, verifyCode }), [isVerifying, verifyCode])
}
