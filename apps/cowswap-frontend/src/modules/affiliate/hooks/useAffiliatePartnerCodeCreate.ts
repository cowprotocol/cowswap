import { useCallback, useState } from 'react'

import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useAffiliatePartnerInfo } from './useAffiliatePartnerInfo'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { AFFILIATE_PAYOUTS_CHAIN_ID } from '../config/affiliateProgram.const'
import {
  AffiliatePartnerCodeCreateError,
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
  const [submitting, setSubmitting] = useState(false)
  const { mutate: mutatePartnerInfo } = useAffiliatePartnerInfo(account)

  const onCreate = useCallback(async (): Promise<void> => {
    if (!account || !provider) return

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

      await bffAffiliateApi.createAffiliateCode({
        code,
        walletAddress: account,
        signedMessage,
      })
      await mutatePartnerInfo()
    } catch (error) {
      setError(mapAffiliatePartnerCodeCreateError(error))
    } finally {
      setSubmitting(false)
    }
  }, [account, code, mutatePartnerInfo, provider, setError])

  return { submitting, onCreate }
}
