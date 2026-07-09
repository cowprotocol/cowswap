import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { areTokensEqual } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { getCountryAsKey, restrictedTokensAtom, RestrictedTokenInfo, useRestrictedToken } from '@cowprotocol/tokens'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGeoStatus } from './useGeoStatus'
import { RwaConsentStatus, useRwaConsentStatus } from './useRwaConsentStatus'

import { RwaConsentKey } from '../types/rwaConsent'

export interface RwaTokenInfo {
  token: Token
  blockedCountries: Set<string>
  consentHash: string
}

export interface RwaTokenStatusResult {
  status: RwaTokenStatus
  rwaTokenInfo: RwaTokenInfo | null
}

export interface UseRwaTokenStatusParams {
  inputCurrency: Nullish<Currency>
  outputCurrency: Nullish<Currency>
}

export enum RwaTokenStatus {
  /** No RWA restrictions - proceed normally */
  Allowed = 'Allowed',
  /** Restriction metadata is still loading - do not proceed yet */
  ChecksPending = 'ChecksPending',
  /** User's country is in the blocked list - cannot trade */
  Restricted = 'Restricted',
  /** Country lookup completed without a country and consent is missing - show consent modal */
  RequiredConsent = 'RequiredConsent',
  /** Country lookup completed without a country but consent already given - can proceed */
  ConsentIsSigned = 'ConsentIsSigned',
}

interface GetRwaTokenStatusParams {
  isRwaGeoblockEnabled: boolean | undefined
  hasTokenToCheck: boolean
  hasRestrictedTokens: boolean
  isRestrictedTokensLoaded: boolean
  country: string | null
  isGeoLoaded: boolean
  isGeoLoading: boolean
  consentStatus: RwaConsentStatus
  isCountryRestricted: boolean
}

export function useRwaTokenStatus({ inputCurrency, outputCurrency }: UseRwaTokenStatusParams): RwaTokenStatusResult {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()
  const restrictedTokensState = useAtomValue(restrictedTokensAtom)

  const inputToken = inputCurrency?.isToken ? inputCurrency : undefined
  const outputToken = outputCurrency?.isToken ? outputCurrency : undefined
  const inputRestrictedToken = useRestrictedToken(inputToken)
  const outputRestrictedToken = useRestrictedToken(outputToken)
  const hasTokenToCheck = Boolean(inputToken || outputToken)

  const rwaTokenInfos = useMemo((): RwaTokenInfo[] => {
    const tokensToCheck = [[inputToken, inputRestrictedToken] as const, [outputToken, outputRestrictedToken] as const]

    return tokensToCheck.reduce<RwaTokenInfo[]>((acc, [token, restrictedToken]) => {
      if (!token || !restrictedToken) {
        return acc
      }

      if (acc.some((item) => areTokensEqual(item.token, token))) {
        return acc
      }

      acc.push(convertToRwaTokenInfo(restrictedToken, token))

      return acc
    }, [])
  }, [inputRestrictedToken, inputToken, outputRestrictedToken, outputToken])

  const rwaTokenInfo = useMemo((): RwaTokenInfo | null => {
    if (rwaTokenInfos.length === 0) {
      return null
    }

    if (geoStatus.country === null) {
      return rwaTokenInfos[0]
    }

    const countryKey = getCountryAsKey(geoStatus.country)

    return rwaTokenInfos.find((token) => token.blockedCountries.has(countryKey)) ?? rwaTokenInfos[0]
  }, [geoStatus.country, rwaTokenInfos])

  const consentKey = useMemo((): RwaConsentKey | null => {
    if (!rwaTokenInfo || !account) {
      return null
    }

    return {
      wallet: account,
      ipfsHash: rwaTokenInfo.consentHash,
    }
  }, [account, rwaTokenInfo])

  const { consentStatus } = useRwaConsentStatus(consentKey)

  const status = useMemo((): RwaTokenStatus => {
    const countryKey = geoStatus.country === null ? null : getCountryAsKey(geoStatus.country)

    return getRwaTokenStatus({
      isRwaGeoblockEnabled,
      hasTokenToCheck,
      hasRestrictedTokens: rwaTokenInfos.length > 0,
      isRestrictedTokensLoaded: restrictedTokensState.isLoaded,
      country: geoStatus.country,
      isGeoLoaded: geoStatus.isLoaded,
      isGeoLoading: geoStatus.isLoading,
      consentStatus,
      isCountryRestricted: countryKey !== null && rwaTokenInfos.some((token) => token.blockedCountries.has(countryKey)),
    })
  }, [
    consentStatus,
    geoStatus.country,
    geoStatus.isLoaded,
    geoStatus.isLoading,
    hasTokenToCheck,
    isRwaGeoblockEnabled,
    restrictedTokensState.isLoaded,
    rwaTokenInfos,
  ])

  return useMemo(() => ({ status, rwaTokenInfo }), [status, rwaTokenInfo])
}

function getRwaTokenStatus(params: GetRwaTokenStatusParams): RwaTokenStatus {
  const {
    isRwaGeoblockEnabled,
    hasTokenToCheck,
    hasRestrictedTokens,
    isRestrictedTokensLoaded,
    country,
    isGeoLoaded,
    isGeoLoading,
    consentStatus,
    isCountryRestricted,
  } = params

  if (isRwaGeoblockEnabled === undefined) {
    return hasTokenToCheck ? RwaTokenStatus.ChecksPending : RwaTokenStatus.Allowed
  }

  if (!isRwaGeoblockEnabled || !hasTokenToCheck) {
    return RwaTokenStatus.Allowed
  }

  if (!isRestrictedTokensLoaded) {
    return RwaTokenStatus.ChecksPending
  }

  if (!hasRestrictedTokens) {
    return RwaTokenStatus.Allowed
  }

  if (country === null) {
    return getUnknownCountryStatus({ isGeoLoaded, isGeoLoading, consentStatus })
  }

  return isCountryRestricted ? RwaTokenStatus.Restricted : RwaTokenStatus.Allowed
}

function getUnknownCountryStatus(
  params: Pick<GetRwaTokenStatusParams, 'isGeoLoaded' | 'isGeoLoading' | 'consentStatus'>,
): RwaTokenStatus {
  if (!params.isGeoLoaded || params.isGeoLoading) {
    return RwaTokenStatus.ChecksPending
  }

  return params.consentStatus === 'valid' ? RwaTokenStatus.ConsentIsSigned : RwaTokenStatus.RequiredConsent
}

function convertToRwaTokenInfo(restrictedInfo: RestrictedTokenInfo, originalToken: Token): RwaTokenInfo {
  return {
    token: originalToken,
    blockedCountries: new Set(restrictedInfo.restrictedCountries),
    consentHash: restrictedInfo.consentHash,
  }
}
