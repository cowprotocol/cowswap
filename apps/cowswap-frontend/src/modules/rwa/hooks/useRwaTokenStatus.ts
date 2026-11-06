import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { areTokensEqual, isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { getCountryAsKey, RestrictedTokenInfo, useAnyRestrictedToken } from '@cowprotocol/tokens'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGeoStatus } from './useGeoStatus'
import { useRwaConsentStatus } from './useRwaConsentStatus'

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
  /** User's country is in the blocked list - cannot trade */
  Restricted = 'Restricted',
  /** Country unknown/loading and consent not yet given - show consent modal */
  RequiredConsent = 'RequiredConsent',
  /** Country unknown/loading but consent already given - can proceed */
  ConsentIsSigned = 'ConsentIsSigned',
}

export function useRwaTokenStatus({ inputCurrency, outputCurrency }: UseRwaTokenStatusParams): RwaTokenStatusResult {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()

  const inputToken = inputCurrency?.isToken ? inputCurrency : undefined
  const outputToken = outputCurrency?.isToken ? outputCurrency : undefined

  const restrictedTokenInfo = useAnyRestrictedToken(inputToken, outputToken)

  const rwaTokenInfo = useMemo((): RwaTokenInfo | null => {
    if (!restrictedTokenInfo) return null

    const matchedToken = areTokensEqual(inputToken, restrictedTokenInfo.token) ? inputToken : outputToken

    if (!matchedToken) return null

    return convertToRwaTokenInfo(restrictedTokenInfo, matchedToken)
  }, [restrictedTokenInfo, inputToken, outputToken])

  const consentKey = useMemo((): RwaConsentKey | null => {
    if (!rwaTokenInfo || !account) {
      return null
    }
    return {
      wallet: account,
      ipfsHash: rwaTokenInfo.consentHash,
    }
  }, [rwaTokenInfo, account])

  const { consentStatus } = useRwaConsentStatus(consentKey)

  const status = useMemo((): RwaTokenStatus => {
    // If RWA geoblock feature is disabled, always allow trading
    if (!isRwaGeoblockEnabled) {
      return RwaTokenStatus.Allowed
    }

    if (!rwaTokenInfo) {
      return RwaTokenStatus.Allowed
    }

    // Geo API response is PRIMARY - overrides any previous consent
    // If we can determine the country, use it regardless of consent status
    // Note: while loading, country is null so we fall through to consent check
    if (geoStatus.country !== null) {
      const countryKey = getCountryAsKey(geoStatus.country)
      if (rwaTokenInfo.blockedCountries.has(countryKey)) {
        return RwaTokenStatus.Restricted
      }
      return RwaTokenStatus.Allowed
    }

    /**
     * A signed consent travels in the appData document, and a Solana order carries only the appData hash,
     * so a consent given here can never be proven against the order. With no fallback to offer, an
     * unknown location blocks instead of asking.
     *
     * This covers the lookup still being in flight, not only a failed one: the alternative is opening a
     * consent flow that cannot be honoured, and a briefly disabled button is the safer way to be wrong.
     */
    if (isSolanaChain(rwaTokenInfo.token.chainId)) {
      return RwaTokenStatus.Restricted
    }

    // Country unknown (loading, failed, or unavailable) - fall back to consent check
    if (consentStatus === 'valid') {
      return RwaTokenStatus.ConsentIsSigned
    }

    return RwaTokenStatus.RequiredConsent
  }, [isRwaGeoblockEnabled, rwaTokenInfo, geoStatus.country, consentStatus])

  return useMemo(() => ({ status, rwaTokenInfo }), [status, rwaTokenInfo])
}

function convertToRwaTokenInfo(restrictedInfo: RestrictedTokenInfo, originalToken: Token): RwaTokenInfo {
  return {
    token: originalToken,
    blockedCountries: new Set(restrictedInfo.restrictedCountries),
    consentHash: restrictedInfo.consentHash,
  }
}
