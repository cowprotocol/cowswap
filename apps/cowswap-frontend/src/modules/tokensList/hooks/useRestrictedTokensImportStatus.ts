import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import {
  findRestrictedToken,
  getCountryAsKey,
  restrictedTokensAtom,
  RestrictedTokenListState,
} from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { getConsentFromCache, rwaConsentCacheAtom, RwaConsentKey, RwaTokenInfo, useGeoStatus } from 'modules/rwa'

export interface RestrictedTokensImportResult {
  isImportDisabled: boolean
  blockReason: string | null
  restrictedTokenInfo: RwaTokenInfo | null
  /** When true, consent modal should be shown before import */
  requiresConsent: boolean
  /** The first restricted token that needs consent */
  tokenNeedingConsent: TokenWithLogo | null
}

const NOT_RESTRICTED_RESULT: RestrictedTokensImportResult = {
  isImportDisabled: false,
  blockReason: null,
  restrictedTokenInfo: null,
  requiresConsent: false,
  tokenNeedingConsent: null,
}

/**
 * Check if any of the tokens are restricted for the user's country (for auto-import flow)
 */
export function useRestrictedTokensImportStatus(tokens: TokenWithLogo[]): RestrictedTokensImportResult {
  const { account } = useWalletInfo()
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const geoStatus = useGeoStatus()
  const restrictedTokensState = useAtomValue(restrictedTokensAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)

  return useMemo(() => {
    if (tokens.length === 0) {
      return NOT_RESTRICTED_RESULT
    }

    if (isRwaGeoblockEnabled === undefined || !restrictedTokensState.isLoaded) {
      return getPendingRestrictionResult()
    }

    if (!isRwaGeoblockEnabled) {
      return NOT_RESTRICTED_RESULT
    }

    const restrictedTokens = getRestrictedTokens(tokens, restrictedTokensState)

    if (restrictedTokens.length === 0) {
      return NOT_RESTRICTED_RESULT
    }

    if (geoStatus.country) {
      const countryKey = getCountryAsKey(geoStatus.country)
      const restrictedTokenInfo = restrictedTokens.find((item) => item.blockedCountries.has(countryKey))

      if (restrictedTokenInfo) {
        return {
          isImportDisabled: true,
          blockReason: t`This token is not available in your region.`,
          restrictedTokenInfo,
          requiresConsent: false,
          tokenNeedingConsent: null,
        }
      }

      return NOT_RESTRICTED_RESULT
    }

    if (!geoStatus.isLoaded || geoStatus.isLoading) {
      return getPendingRestrictionResult()
    }

    return getUnknownCountryResult(restrictedTokens, account, consentCache)
  }, [
    account,
    consentCache,
    geoStatus.country,
    geoStatus.isLoaded,
    geoStatus.isLoading,
    isRwaGeoblockEnabled,
    restrictedTokensState,
    tokens,
  ])
}

function getPendingRestrictionResult(): RestrictedTokensImportResult {
  return {
    isImportDisabled: true,
    blockReason: t`Checking token availability.`,
    restrictedTokenInfo: null,
    requiresConsent: false,
    tokenNeedingConsent: null,
  }
}

function getRestrictedTokens(tokens: TokenWithLogo[], restrictedTokensState: RestrictedTokenListState): RwaTokenInfo[] {
  return tokens.reduce<RwaTokenInfo[]>((acc, token) => {
    const restrictedInfo = findRestrictedToken(token, restrictedTokensState)

    if (!restrictedInfo) {
      return acc
    }

    acc.push({
      token,
      blockedCountries: new Set(restrictedInfo.restrictedCountries),
      consentHash: restrictedInfo.consentHash,
    })

    return acc
  }, [])
}

function getUnknownCountryResult(
  restrictedTokens: RwaTokenInfo[],
  account: string | undefined,
  consentCache: Record<string, string>,
): RestrictedTokensImportResult {
  const tokenNeedingConsent = restrictedTokens.find((item) => {
    if (!account) {
      return true
    }

    const consentKey: RwaConsentKey = { wallet: account, ipfsHash: item.consentHash }

    return !getConsentFromCache(consentCache, consentKey)?.acceptedAt
  })

  if (!tokenNeedingConsent) {
    return NOT_RESTRICTED_RESULT
  }

  return {
    isImportDisabled: false,
    blockReason: null,
    restrictedTokenInfo: tokenNeedingConsent,
    requiresConsent: true,
    tokenNeedingConsent: TokenWithLogo.fromToken(tokenNeedingConsent.token),
  }
}
