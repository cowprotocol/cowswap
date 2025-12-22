import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { findRestrictedToken, restrictedTokensAtom, RestrictedTokenInfo } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGeoStatus } from 'modules/rwa/hooks/useGeoStatus'
import { getConsentFromCache, rwaConsentCacheAtom } from 'modules/rwa/state/rwaConsentAtom'
import { RwaConsentKey } from 'modules/rwa/types/rwaConsent'

export enum RestrictedTokenImportStatus {
  NotRestricted = 'NotRestricted',
  Blocked = 'Blocked',
  ConsentRequired = 'ConsentRequired',
  ConsentGiven = 'ConsentGiven',
  Loading = 'Loading',
}

export interface RestrictedTokenImportResult {
  status: RestrictedTokenImportStatus
  restrictedInfo: RestrictedTokenInfo | null
  isImportDisabled: boolean
  blockReason: string | null
}

export function useRestrictedTokenImportStatus(token: TokenWithLogo | undefined): RestrictedTokenImportResult {
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()
  const restrictedList = useAtomValue(restrictedTokensAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)

  return useMemo(() => {
    if (!token) {
      return {
        status: RestrictedTokenImportStatus.NotRestricted,
        restrictedInfo: null,
        isImportDisabled: false,
        blockReason: null,
      }
    }

    const restrictedInfo = findRestrictedToken(token, restrictedList)

    if (!restrictedInfo) {
      return {
        status: RestrictedTokenImportStatus.NotRestricted,
        restrictedInfo: null,
        isImportDisabled: false,
        blockReason: null,
      }
    }

    if (geoStatus.isLoading) {
      return {
        status: RestrictedTokenImportStatus.Loading,
        restrictedInfo,
        isImportDisabled: true,
        blockReason: 'Checking your location...',
      }
    }

    if (geoStatus.country) {
      const countryUpper = geoStatus.country.toUpperCase()
      const blockedCountries = new Set(restrictedInfo.restrictedCountries)

      if (blockedCountries.has(countryUpper)) {
        return {
          status: RestrictedTokenImportStatus.Blocked,
          restrictedInfo,
          isImportDisabled: true,
          blockReason: 'This token is not available in your region.',
        }
      }

      return {
        status: RestrictedTokenImportStatus.NotRestricted,
        restrictedInfo: null,
        isImportDisabled: false,
        blockReason: null,
      }
    }

    const consentKey: RwaConsentKey | null = account ? { wallet: account, ipfsHash: restrictedInfo.tosHash } : null

    if (consentKey) {
      const existingConsent = getConsentFromCache(consentCache, consentKey)
      if (existingConsent?.acceptedAt) {
        return {
          status: RestrictedTokenImportStatus.ConsentGiven,
          restrictedInfo,
          isImportDisabled: false,
          blockReason: null,
        }
      }
    }

    return {
      status: RestrictedTokenImportStatus.ConsentRequired,
      restrictedInfo,
      isImportDisabled: false,
      blockReason: null,
    }
  }, [token, restrictedList, geoStatus, account, consentCache])
}
