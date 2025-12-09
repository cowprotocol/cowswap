import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { getConsentFromCache, rwaConsentCacheAtom } from 'modules/rwa/state/rwaConsentAtom'
import { RwaConsentKey } from 'modules/rwa/types/rwaConsent'
import { getRwaTokenInfo } from 'modules/rwa/utils/getRwaTokenInfo'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { AppDataRwaConsent } from '../types'

export function useRwaConsentForAppData(): AppDataRwaConsent | undefined {
  const { account } = useWalletInfo()
  const derivedState = useDerivedTradeState()
  const consentCache = useAtomValue(rwaConsentCacheAtom)

  const inputCurrency = derivedState?.inputCurrency ?? null
  const outputCurrency = derivedState?.outputCurrency ?? null

  const rwaTokenInfo = useMemo(() => {
    const inputRwaInfo = getRwaTokenInfo(inputCurrency)
    const outputRwaInfo = getRwaTokenInfo(outputCurrency)
    return inputRwaInfo || outputRwaInfo
  }, [inputCurrency, outputCurrency])

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!rwaTokenInfo || !account) {
      return null
    }
    return {
      wallet: account,
      issuer: rwaTokenInfo.issuer,
      tosVersion: rwaTokenInfo.tosVersion,
    }
  }, [rwaTokenInfo, account])

  return useMemo(() => {
    if (!consentKey || !account || !rwaTokenInfo) {
      return undefined
    }

    const consentRecord = getConsentFromCache(consentCache, consentKey)

    if (!consentRecord?.confirmed) {
      return undefined
    }

    return {
      wallet: account,
      rwa: {
        issuer: rwaTokenInfo.issuer,
        assetGroup: rwaTokenInfo.assetGroup,
      },
      geo: {
        ipStatus: consentRecord.geoMode,
        country: undefined, // TODO: get from geo service when geoMode is ALLOWED
      },
      userDeclaration: {
        notRestricted: true,
        acceptedTosVersion: rwaTokenInfo.tosVersion,
      },
    }
  }, [consentKey, account, rwaTokenInfo, consentCache])
}
