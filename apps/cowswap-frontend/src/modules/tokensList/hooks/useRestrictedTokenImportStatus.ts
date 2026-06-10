import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getCountryAsKey, restrictedTokensAtom, RestrictedTokenInfo, useRestrictedToken } from '@cowprotocol/tokens'

import { t } from '@lingui/core/macro'

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

const NOT_RESTRICTED_RESULT: RestrictedTokenImportResult = {
  status: RestrictedTokenImportStatus.NotRestricted,
  restrictedInfo: null,
  isImportDisabled: false,
  blockReason: null,
}

function getPendingRestrictionResult(): RestrictedTokenImportResult {
  return {
    status: RestrictedTokenImportStatus.Blocked,
    restrictedInfo: null,
    isImportDisabled: true,
    blockReason: t`Checking token availability.`,
  }
}

export function useRestrictedTokenImportStatus(token: TokenWithLogo | undefined): RestrictedTokenImportResult {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const geoStatus = useGeoStatus()
  const restrictedInfo = useRestrictedToken(token)
  const restrictedTokensState = useAtomValue(restrictedTokensAtom)

  return useMemo(() => {
    if (isRwaGeoblockEnabled === undefined) {
      return getPendingRestrictionResult()
    }

    if (!isRwaGeoblockEnabled) {
      return NOT_RESTRICTED_RESULT
    }

    if (!restrictedTokensState.isLoaded) {
      return getPendingRestrictionResult()
    }

    if (!restrictedInfo) {
      return NOT_RESTRICTED_RESULT
    }

    if (geoStatus.country) {
      const countryKey = getCountryAsKey(geoStatus.country)
      const blockedCountries = new Set(restrictedInfo.restrictedCountries)

      if (blockedCountries.has(countryKey)) {
        return {
          status: RestrictedTokenImportStatus.Blocked,
          restrictedInfo,
          isImportDisabled: true,
          blockReason: t`This token is not available in your region.`,
        }
      }
    }

    return getPendingRestrictionResult()
  }, [geoStatus.country, isRwaGeoblockEnabled, restrictedInfo, restrictedTokensState.isLoaded])
}
