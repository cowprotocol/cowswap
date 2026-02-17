import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

import { delay } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import { PartnerCodeResponse, PartnerStatsResponse } from 'modules/affiliate/lib/affiliateProgramTypes'

const MIN_LOADING_MS = 200

interface UseAffiliatePartnerDataParams {
  account: string | undefined
  isMainnet: boolean
}

interface CreateAffiliateCodeParams {
  code: string
  walletAddress: string
  signedMessage: string
}

interface UseAffiliatePartnerDataResult {
  codeLoading: boolean
  statsLoading: boolean
  existingCode: string | null
  createdAt: Date | null
  programParams: PartnerCodeResponse | null
  partnerStats: PartnerStatsResponse | null
  errorMessage: string | null
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  createAffiliateCode: (params: CreateAffiliateCodeParams) => Promise<PartnerCodeResponse>
}

export function useAffiliatePartnerData({
  account,
  isMainnet,
}: UseAffiliatePartnerDataParams): UseAffiliatePartnerDataResult {
  const [codeLoading, setCodeLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [existingCode, setExistingCode] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState<Date | null>(null)
  const [programParams, setProgramParams] = useState<PartnerCodeResponse | null>(null)
  const [partnerStats, setPartnerStats] = useState<PartnerStatsResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!account || !isMainnet) {
      setExistingCode(null)
      setCreatedAt(null)
      setCodeLoading(false)
      setPartnerStats(null)
      setProgramParams(null)
      setErrorMessage(null)
      return
    }

    const loadCode = async (): Promise<void> => {
      setCodeLoading(true)
      setErrorMessage(null)

      try {
        const [response] = await Promise.all([bffAffiliateApi.getAffiliateCode(account), delay(MIN_LOADING_MS)])
        if (cancelled) {
          return
        }

        if (response?.code) {
          setStatsLoading(true)
          setExistingCode(response.code)
          const created = response.createdAt ? new Date(response.createdAt) : null
          setCreatedAt(created && !Number.isNaN(created.getTime()) ? created : null)
          setProgramParams(response)
        } else {
          setExistingCode(null)
          setCreatedAt(null)
          setProgramParams(null)
          setStatsLoading(false)
        }
      } catch {
        if (cancelled) {
          return
        }

        setExistingCode(null)
        setCreatedAt(null)
        setProgramParams(null)
        setStatsLoading(false)
        setErrorMessage(t`Affiliate service is unreachable. Try again later.`)
      }

      setCodeLoading(false)
    }

    void loadCode()

    return () => {
      cancelled = true
    }
  }, [account, isMainnet])

  useEffect(() => {
    let cancelled = false

    if (!account || !isMainnet || !existingCode) {
      setPartnerStats(null)
      setStatsLoading(false)

      if (!account || !isMainnet) {
        setErrorMessage(null)
      }
      return
    }

    const loadStats = async (): Promise<void> => {
      setStatsLoading(true)
      try {
        const [stats] = await Promise.all([bffAffiliateApi.getAffiliateStats(account), delay(MIN_LOADING_MS)])
        if (cancelled) {
          return
        }

        setPartnerStats(stats)
      } catch {
        if (cancelled) {
          return
        }

        setPartnerStats(null)
        setErrorMessage(t`Affiliate stats are temporarily unavailable. Try again later.`)
      }

      setStatsLoading(false)
    }

    void loadStats()

    return () => {
      cancelled = true
    }
  }, [account, existingCode, isMainnet])

  const createAffiliateCode = useCallback(
    async ({ code, walletAddress, signedMessage }: CreateAffiliateCodeParams): Promise<PartnerCodeResponse> => {
      const response = await bffAffiliateApi.createAffiliateCode({
        code,
        walletAddress,
        signedMessage,
      })

      setExistingCode(response.code)
      const created = response.createdAt ? new Date(response.createdAt) : null
      setCreatedAt(created && !Number.isNaN(created.getTime()) ? created : null)
      setProgramParams(response)

      return response
    },
    [],
  )

  return {
    codeLoading,
    statsLoading,
    existingCode,
    createdAt,
    programParams,
    partnerStats,
    errorMessage,
    setErrorMessage,
    createAffiliateCode,
  }
}
