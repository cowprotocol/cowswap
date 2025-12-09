import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { getRwaConsentAtom } from 'modules/rwa/state/rwaConsentAtom'
import { RwaConsentKey } from 'modules/rwa/types/rwaConsent'
import { getRwaTokenInfo } from 'modules/rwa/utils/getRwaTokenInfo'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { AppDataRwaConsent } from '../types'

export function useRwaConsentForAppData(): AppDataRwaConsent | undefined {
  const { account } = useWalletInfo()
  const derivedState = useDerivedTradeState()

  const inputCurrency = derivedState?.inputCurrency ?? null
  const outputCurrency = derivedState?.outputCurrency ?? null

  const rwaTokenInfo = useMemo(() => {
    const inputRwaInfo = getRwaTokenInfo(inputCurrency)
    const outputRwaInfo = getRwaTokenInfo(outputCurrency)
    return inputRwaInfo || outputRwaInfo
  }, [inputCurrency, outputCurrency])

  // Build consent key
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

  // Get consent record from storage
  const defaultConsentAtom = getRwaConsentAtom({ wallet: '', issuer: '', tosVersion: '' })
  const consentAtom = consentKey ? getRwaConsentAtom(consentKey) : defaultConsentAtom
  const consentRecord = useAtomValue(consentAtom)

  // Build rwaConsent payload only if consent is confirmed
  return useMemo(() => {
    if (!consentKey || !account || !rwaTokenInfo || !consentRecord.confirmed) {
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
  }, [consentKey, account, rwaTokenInfo, consentRecord])
}
