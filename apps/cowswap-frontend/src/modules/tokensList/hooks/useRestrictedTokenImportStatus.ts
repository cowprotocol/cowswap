import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { RestrictedTokenInfo, useRestrictedToken } from '@cowprotocol/tokens'

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

export function useRestrictedTokenImportStatus(token: TokenWithLogo | undefined): RestrictedTokenImportResult {
  const geoStatus = useGeoStatus()
  const restrictedInfo = useRestrictedToken(token)

  return useMemo(() => {
    // if geo is loading or token is not restricted, allow import
    if (geoStatus.isLoading || !restrictedInfo) {
      return NOT_RESTRICTED_RESULT
    }

    // only block import if country is known and blocked
    if (geoStatus.country) {
      const countryUpper = geoStatus.country.toUpperCase()
      const blockedCountries = new Set(restrictedInfo.restrictedCountries)

      if (blockedCountries.has(countryUpper)) {
        return {
          status: RestrictedTokenImportStatus.Blocked,
          restrictedInfo,
          isImportDisabled: true,
          blockReason: t`This token is not available in your region.`,
        }
      }
    }

    return NOT_RESTRICTED_RESULT
  }, [geoStatus, restrictedInfo])
}
