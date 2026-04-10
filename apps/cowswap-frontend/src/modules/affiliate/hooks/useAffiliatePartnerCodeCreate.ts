import { useCallback, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useAffiliatePartnerInfo } from './useAffiliatePartnerInfo'

import {
  normalizeAffiliatePartnerCodeCreateFailureReason,
  trackAffiliateEvent,
} from '../analytics/affiliateAnalytics.utils'
import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { AFFILIATE_PAYOUTS_CHAIN_ID } from '../config/affiliateProgram.const'
import {
  type AffiliatePartnerCodeCreateError,
  mapAffiliatePartnerCodeCreateError,
} from '../lib/affiliatePartnerCodeCreateError'
import { buildPartnerTypedData } from '../lib/affiliateProgramUtils'

interface UseAffiliatePartnerCodeCreateParams {
  account: string | undefined
  provider: ReturnType<typeof useWalletProvider>
  code: string
  setError: (error?: AffiliatePartnerCodeCreateError) => void
}

interface UseAffiliatePartnerCodeCreateResult {
  submitting: boolean
  onCreate: () => Promise<void>
}

export function useAffiliatePartnerCodeCreate({
  account,
  provider,
  code,
  setError,
}: UseAffiliatePartnerCodeCreateParams): UseAffiliatePartnerCodeCreateResult {
  const analytics = useCowAnalytics()
  const [submitting, setSubmitting] = useState(false)
  const { mutate: mutatePartnerInfo } = useAffiliatePartnerInfo(account)

  const onCreate = useCallback(async (): Promise<void> => {
    if (!account || !provider) return

    trackAffiliateEvent({
      analytics,
      action: 'affiliate_partner_code_create_started',
      chainId: AFFILIATE_PAYOUTS_CHAIN_ID,
    })

    setSubmitting(true)
    setError(undefined)

    try {
      const signer = provider.getSigner()
      const typedData = buildPartnerTypedData({
        walletAddress: account,
        code,
        chainId: AFFILIATE_PAYOUTS_CHAIN_ID,
      })
      const signedMessage = await signer._signTypedData(typedData.domain, typedData.types, typedData.message)

      await bffAffiliateApi.createCode({
        code,
        walletAddress: account,
        signedMessage,
      })

      trackAffiliateEvent({
        analytics,
        action: 'affiliate_partner_code_create_completed',
        chainId: AFFILIATE_PAYOUTS_CHAIN_ID,
        result: 'success',
      })
      await mutatePartnerInfo().catch()
    } catch (error) {
      const mappedError = mapAffiliatePartnerCodeCreateError(error)

      setError(mappedError)
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_partner_code_create_completed',
        chainId: AFFILIATE_PAYOUTS_CHAIN_ID,
        result: 'failed',
        failureReason: normalizeAffiliatePartnerCodeCreateFailureReason(mappedError),
      })
    } finally {
      setSubmitting(false)
    }
  }, [account, analytics, code, mutatePartnerInfo, provider, setError])

  return useMemo(() => ({ submitting, onCreate }), [submitting, onCreate])
}
