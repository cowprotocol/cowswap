import { useMemo } from 'react'

import { areTokensEqual } from '@cowprotocol/common-utils'
import { useAnyRestrictedToken, RestrictedTokenInfo } from '@cowprotocol/tokens'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, Token } from '@uniswap/sdk-core'

import { useGeoCountry } from './useGeoCountry'
import { useRwaConsentStatus } from './useRwaConsentStatus'

import { RwaConsentKey } from '../types/rwaConsent'

export enum RwaTokenStatus {
  /** No RWA restrictions - proceed normally */
  Allowed = 'Allowed',
  /** User's country is in the blocked list - cannot trade */
  Restricted = 'Restricted',
  /** Country unknown and consent not yet given - show consent modal */
  RequiredConsent = 'RequiredConsent',
  /** Country unknown but consent already given - can proceed */
  ConsentIsSigned = 'ConsentIsSigned',
}

export interface RwaTokenInfo {
  token: Token
  blockedCountries: Set<string>
  tosHash: string
}

export interface RwaTokenStatusResult {
  status: RwaTokenStatus
  rwaTokenInfo: RwaTokenInfo | null
}

export interface UseRwaTokenStatusParams {
  inputCurrency: Nullish<Currency>
  outputCurrency: Nullish<Currency>
}

function convertToRwaTokenInfo(restrictedInfo: RestrictedTokenInfo, originalToken: Token): RwaTokenInfo {
  return {
    token: originalToken,
    blockedCountries: new Set(restrictedInfo.restrictedCountries),
    tosHash: restrictedInfo.tosHash,
  }
}

export function useRwaTokenStatus({ inputCurrency, outputCurrency }: UseRwaTokenStatusParams): RwaTokenStatusResult {
  const { account } = useWalletInfo()
  const geoCountry = useGeoCountry()

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
      ipfsHash: rwaTokenInfo.tosHash,
    }
  }, [rwaTokenInfo, account])

  const { consentStatus } = useRwaConsentStatus(consentKey)

  const status = useMemo((): RwaTokenStatus => {
    if (!rwaTokenInfo) {
      return RwaTokenStatus.Allowed
    }

    // Geo API response is PRIMARY - overrides any previous consent
    // If we can determine the country, use it regardless of consent status
    if (geoCountry !== null) {
      if (rwaTokenInfo.blockedCountries.has(geoCountry)) {
        return RwaTokenStatus.Restricted
      }
      return RwaTokenStatus.Allowed
    }

    // Country unknown - fall back to consent check
    if (consentStatus === 'valid') {
      return RwaTokenStatus.ConsentIsSigned
    }

    return RwaTokenStatus.RequiredConsent
  }, [rwaTokenInfo, geoCountry, consentStatus])

  return {
    status,
    rwaTokenInfo,
  }
}
