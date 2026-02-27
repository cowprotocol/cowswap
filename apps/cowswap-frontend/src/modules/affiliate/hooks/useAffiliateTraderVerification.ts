import { useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { t } from '@lingui/core/macro'

import { safeShortenAddress } from 'utils/address'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import { setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { ApiError } from '../utils/api-utils'
import { logAffiliate } from '../utils/logger'

interface VerificationParams {
  setError(error?: string): void
}

export interface UseAffiliateTraderVerificationResult {
  isVerifying: boolean
  verifyCode(code: string, account: string): Promise<void>
}

export function useAffiliateTraderVerification(params: VerificationParams): UseAffiliateTraderVerificationResult {
  const { setError } = params
  const analytics = useCowAnalytics()
  const [isVerifying, setIsVerifying] = useState(false)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)

  const verifyCode = useCallback(
    async (code: string, account: string): Promise<void> => {
      analytics.sendEvent({ category: 'affiliate', action: 'verify_started', label: code })
      setError(undefined)
      setIsVerifying(true)

      try {
        if (!formatRefCode(code)) {
          logAffiliate(safeShortenAddress(account), 'Code verification failed: invalid referral code format')
          setError(t`This code is invalid. Try another.`)
          return
        }

        try {
          await bffAffiliateApi.verifyCode(code)
        } catch (error) {
          if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
            logAffiliate(safeShortenAddress(account), 'Code verification failed: invalid referral code')
            setError(t`This code is invalid. Try another.`)
            return
          }

          throw error
        }

        const partnerInfo = await bffAffiliateApi.getPartnerInfo(account)
        if (partnerInfo?.code === code) {
          logAffiliate(safeShortenAddress(account), 'Code verification failed: self-referral')
          setError(t`You cannot apply your own referral code.`)
          return
        }

        logAffiliate(safeShortenAddress(account), 'Trader verification succeeded')

        setSavedCode({ savedCode: code, isLinked: false })
        setError(undefined)
        analytics.sendEvent({
          category: 'affiliate',
          action: 'verify_result',
        })
      } catch (error) {
        setError(t`Affiliate service is unreachable. Try again later.`)
        logAffiliate(safeShortenAddress(account), `Code verification failed`, error)
      } finally {
        setIsVerifying(false)
      }
    },
    [analytics, setError, setSavedCode],
  )

  return useMemo(() => ({ isVerifying, verifyCode }), [isVerifying, verifyCode])
}
