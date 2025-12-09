import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { getRwaConsentAtom } from '../state/rwaConsentAtom'
import { RwaConsentKey } from '../types/rwaConsent'

export interface RwaConsentPayload {
  wallet: string
  rwa: {
    issuer: string
    assetGroup?: string
  }
  geo: {
    ipStatus: 'ALLOWED' | 'UNKNOWN'
    country?: string
  }
  userDeclaration: {
    notRestricted: boolean
    acceptedTosVersion: string
  }
}

export function useRwaConsentPayload(
  rwaTokenInfo: { issuer: string; tosVersion: string; assetGroup?: string } | null,
): RwaConsentPayload | null {
  const { account } = useWalletInfo()

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

  const consentAtom = consentKey ? getRwaConsentAtom(consentKey) : null
  const consentRecord = useAtomValue(consentAtom ?? getRwaConsentAtom({ wallet: '', issuer: '', tosVersion: '' }))

  return useMemo(() => {
    if (!consentKey || !account || !rwaTokenInfo || !consentRecord.confirmed) {
      return null
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
