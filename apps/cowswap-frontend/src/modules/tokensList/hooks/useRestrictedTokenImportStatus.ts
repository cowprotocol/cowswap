import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { findRestrictedToken, restrictedTokensAtom, RestrictedTokenInfo } from '@cowprotocol/tokens'

import { useGeoStatus } from 'modules/rwa'

export enum RestrictedTokenImportStatus {
  NotRestricted = 'NotRestricted',
  Blocked = 'Blocked',
}

export interface RestrictedTokenImportResult {
  status: RestrictedTokenImportStatus
  restrictedInfo: RestrictedTokenInfo | null
  isImportDisabled: boolean
  blockReason: string | null
}

export function useRestrictedTokenImportStatus(token: TokenWithLogo | undefined): RestrictedTokenImportResult {
  const geoStatus = useGeoStatus()
  const restrictedList = useAtomValue(restrictedTokensAtom)

  return useMemo(() => {
    // if geo or restricted list is loading, allow import (will be checked at trade time)
    if (!token || !restrictedList.isLoaded || geoStatus.isLoading) {
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

    // Only block import if country is known and blocked
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
    }

    return {
      status: RestrictedTokenImportStatus.NotRestricted,
      restrictedInfo: null,
      isImportDisabled: false,
      blockReason: null,
    }
  }, [token, restrictedList, geoStatus])
}
