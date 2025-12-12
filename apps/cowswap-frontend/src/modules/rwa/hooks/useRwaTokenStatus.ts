import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { Token } from '@uniswap/sdk-core'

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
  issuer: string
  tosVersion: string
  issuerName?: string
  blockedCountries: Set<string>
  termsIpfsHash: string
}

export interface RwaTokenStatusResult {
  status: RwaTokenStatus
  rwaTokenInfo: RwaTokenInfo | null
}

export interface UseRwaTokenStatusParams {
  inputToken: Token | undefined
  outputToken: Token | undefined
}

/**
 * TODO: Implement actual RWA token detection from token list
 */
function getRwaTokenFromList(inputToken: Token | undefined, outputToken: Token | undefined): RwaTokenInfo | null {
  // TODO: Replace with actual token list check
  // For now, treat ALL tokens as RWA for testing purposes
  const token = inputToken || outputToken
  if (!token) {
    return null
  }

  return {
    token,
    issuer: 'test-issuer',
    tosVersion: 'rwa-tos-v1',
    issuerName: 'Test RWA Issuer',
    blockedCountries: new Set(['US']),
    termsIpfsHash: '', // TODO: add IPFS hash
  }
}

export function useRwaTokenStatus({ inputToken, outputToken }: UseRwaTokenStatusParams): RwaTokenStatusResult {
  const { account } = useWalletInfo()
  const geoCountry = useGeoCountry()

  // Check if any of the tokens is an RWA token
  const rwaTokenInfo = useMemo(() => {
    return getRwaTokenFromList(inputToken, outputToken)
  }, [inputToken, outputToken])

  const consentKey: RwaConsentKey = useMemo(() => {
    if (!rwaTokenInfo || !account) {
      return { wallet: '', tosVersion: '' }
    }
    return {
      wallet: account,
      tosVersion: rwaTokenInfo.tosVersion,
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
