import { useCallback, useMemo, useState } from 'react'

import { WalletClient } from 'viem'

import { useAffiliatePartnerInfo } from './useAffiliatePartnerInfo'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { AFFILIATE_PAYOUTS_CHAIN_ID } from '../config/affiliateProgram.const'
import {
  type AffiliatePartnerCodeCreateError,
  mapAffiliatePartnerCodeCreateError,
} from '../lib/affiliatePartnerCodeCreateError'
import { buildPartnerTypedData } from '../lib/affiliateProgramUtils'

interface UseAffiliatePartnerCodeCreateParams {
  account: string | undefined
  walletClient?: WalletClient
  code: string
  setError: (error?: AffiliatePartnerCodeCreateError) => void
}

interface UseAffiliatePartnerCodeCreateResult {
  submitting: boolean
  onCreate: () => Promise<void>
}

export function useAffiliatePartnerCodeCreate({
  account,
  walletClient,
  code,
  setError,
}: UseAffiliatePartnerCodeCreateParams): UseAffiliatePartnerCodeCreateResult {
  const [submitting, setSubmitting] = useState(false)
  const { mutate: mutatePartnerInfo } = useAffiliatePartnerInfo(account)

  const onCreate = useCallback(async (): Promise<void> => {
    if (!account || !walletClient || !walletClient.account) return

    setSubmitting(true)
    setError(undefined)

    try {
      const typedData = buildPartnerTypedData({
        walletAddress: account,
        code,
        chainId: AFFILIATE_PAYOUTS_CHAIN_ID,
      })
      const signedMessage = await walletClient.signTypedData({
        account: walletClient.account?.address,
        domain: typedData.domain,
        types: typedData.types,
        primaryType: 'AffiliateCode',
        message: typedData.message,
      })

      await bffAffiliateApi.createCode({
        code,
        walletAddress: account,
        signedMessage,
      })

      await mutatePartnerInfo().catch()
    } catch (error) {
      setError(mapAffiliatePartnerCodeCreateError(error))
    } finally {
      setSubmitting(false)
    }
  }, [account, code, mutatePartnerInfo, walletClient, setError])

  return useMemo(() => ({ submitting, onCreate }), [submitting, onCreate])
}
