import { useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'

import { safeShortenAddress } from 'utils/address'

import { TraderWalletStatus } from './useAffiliateTraderWallet'

import { AffiliateCodeSource, AffiliateVerificationResult } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import { setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { ApiError } from '../utils/api-utils'
import { logAffiliate } from '../utils/logger'

export interface VerifyAffiliateCodeParams {
  account: string
  code: string
  codeSource: AffiliateCodeSource
}

export interface UseAffiliateTraderVerificationResult {
  isVerifying: boolean
  verifyCode(params: VerifyAffiliateCodeParams): Promise<void>
}

interface VerificationParams {
  requiresPayoutConfirmation: boolean
  setError(error?: string): void
  walletStatus: TraderWalletStatus
}

interface TrackTraderVerificationEventParams {
  analytics: ReturnType<typeof useCowAnalytics>
  chainId: number | undefined
  codeSource: AffiliateCodeSource
  verificationResult: AffiliateVerificationResult
  walletStatus: TraderWalletStatus
}

interface VerifyTraderAffiliateCodeParams {
  account: string
  analytics: ReturnType<typeof useCowAnalytics>
  chainId: number | undefined
  code: string
  codeSource: AffiliateCodeSource
  requiresPayoutConfirmation: boolean
  setError(error?: string): void
  setSavedCode: (value: { savedCode: string; isLinked: boolean; source: AffiliateCodeSource }) => void
  walletStatus: TraderWalletStatus
}

function trackTraderVerificationCompleted({
  analytics,
  chainId,
  codeSource,
  verificationResult,
  walletStatus,
}: TrackTraderVerificationEventParams): void {
  trackAffiliateEvent({
    analytics,
    action: 'affiliate_trader_code_verification_completed',
    chainId,
    verificationResult,
    codeSource,
    walletStatus,
  })
}

async function verifyTraderAffiliateCode({
  account,
  analytics,
  chainId,
  code,
  codeSource,
  requiresPayoutConfirmation,
  setError,
  setSavedCode,
  walletStatus,
}: VerifyTraderAffiliateCodeParams): Promise<void> {
  const formattedCode = formatRefCode(code)

  trackAffiliateEvent({
    analytics,
    action: 'affiliate_trader_code_verification_started',
    chainId,
    codeSource,
    walletStatus,
    requiresPayoutConfirmation,
  })
  setError(undefined)

  if (!formattedCode) {
    logAffiliate(safeShortenAddress(account), 'Code verification failed: invalid referral code format')
    setError(t`Only A-Z, 0-9, dashes, and underscores are allowed.`)
    trackTraderVerificationCompleted({
      analytics,
      chainId,
      codeSource,
      verificationResult: AffiliateVerificationResult.INVALID_FORMAT,
      walletStatus,
    })
    return
  }

  try {
    await bffAffiliateApi.verifyCode(formattedCode)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      logAffiliate(safeShortenAddress(account), 'Code verification failed: invalid referral code')
      setError(t`This code is invalid. Try another.`)
      trackTraderVerificationCompleted({
        analytics,
        chainId,
        codeSource,
        verificationResult: AffiliateVerificationResult.INVALID_CODE,
        walletStatus,
      })
      return
    }

    throw error
  }

  const partnerInfo = await bffAffiliateApi.getPartnerInfo(account)

  if (partnerInfo?.code === formattedCode) {
    logAffiliate(safeShortenAddress(account), 'Code verification failed: self-referral')
    setError(t`You cannot apply your own referral code.`)
    trackTraderVerificationCompleted({
      analytics,
      chainId,
      codeSource,
      verificationResult: AffiliateVerificationResult.SELF_REFERRAL,
      walletStatus,
    })
    return
  }

  logAffiliate(safeShortenAddress(account), 'Trader verification succeeded')
  setSavedCode({ savedCode: formattedCode, isLinked: false, source: codeSource })
  setError(undefined)
  trackTraderVerificationCompleted({
    analytics,
    chainId,
    codeSource,
    verificationResult: AffiliateVerificationResult.SUCCESS,
    walletStatus,
  })
}

export function useAffiliateTraderVerification(params: VerificationParams): UseAffiliateTraderVerificationResult {
  const { requiresPayoutConfirmation, setError, walletStatus } = params
  const analytics = useCowAnalytics()
  const chainId = useWalletChainId()
  const [isVerifying, setIsVerifying] = useState(false)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)

  const verifyCode = useCallback(
    async ({ account, code, codeSource }: VerifyAffiliateCodeParams): Promise<void> => {
      setIsVerifying(true)

      try {
        await verifyTraderAffiliateCode({
          account,
          analytics,
          chainId,
          code,
          codeSource,
          requiresPayoutConfirmation,
          setError,
          setSavedCode,
          walletStatus,
        })
      } catch (error) {
        setError(t`Affiliate service is unreachable. Try again later.`)
        logAffiliate(safeShortenAddress(account), `Code verification failed`, error)
        trackTraderVerificationCompleted({
          analytics,
          chainId,
          codeSource,
          verificationResult: AffiliateVerificationResult.SERVICE_UNAVAILABLE,
          walletStatus,
        })
      } finally {
        setIsVerifying(false)
      }
    },
    [analytics, chainId, requiresPayoutConfirmation, setError, setSavedCode, walletStatus],
  )

  return useMemo(() => ({ isVerifying, verifyCode }), [isVerifying, verifyCode])
}
