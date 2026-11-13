import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { useIsRwaToken } from '@cowprotocol/tokens'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGeoStatus } from './useGeoStatus'
import { useRwaConsentStatus } from './useRwaConsentStatus'
import { useTokenRestriction } from './useTokenRestriction'

import { TokenRestriction } from '../api/fetchTokenRestriction'
import { RWA_CONSENT_HASH } from '../const'
import { RwaConsentKey } from '../types/rwaConsent'

export interface RwaTokenInfo {
  token: Token
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
  /** Restriction unknown and consent not yet given - show consent modal */
  RequiredConsent = 'RequiredConsent',
  /** Restriction unknown but consent already given - can proceed */
  ConsentIsSigned = 'ConsentIsSigned',
}

interface TokenCheck {
  token: Token | undefined
  restriction: TokenRestriction | undefined
  isRwa: boolean
}

/**
 * The BFF decides whether a token is restricted in the user's country. Until it has answered — the
 * country is unknown, the request is in flight, or it failed — a token from an RWA list is treated as
 * possibly restricted, and any other token as allowed.
 */
export function useRwaTokenStatus({ inputCurrency, outputCurrency }: UseRwaTokenStatusParams): RwaTokenStatusResult {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()

  const inputToken = inputCurrency?.isToken ? inputCurrency : undefined
  const outputToken = outputCurrency?.isToken ? outputCurrency : undefined

  const isEnabled = !!isRwaGeoblockEnabled
  const inputRestriction = useTokenRestriction(inputToken, geoStatus.country, isEnabled)
  const outputRestriction = useTokenRestriction(outputToken, geoStatus.country, isEnabled)
  const isInputRwa = useIsRwaToken(inputToken)
  const isOutputRwa = useIsRwaToken(outputToken)

  const input = { token: inputToken, restriction: inputRestriction, isRwa: isInputRwa }
  const output = { token: outputToken, restriction: outputRestriction, isRwa: isOutputRwa }
  const restrictedToken = findToken(input, output, isRestricted)
  const rwaToken = restrictedToken ?? findToken(input, output, isUnresolvedRwa)

  const rwaTokenInfo = useMemo((): RwaTokenInfo | null => {
    return rwaToken ? { token: rwaToken, consentHash: RWA_CONSENT_HASH } : null
  }, [rwaToken])

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
    if (!isEnabled || !rwaTokenInfo) {
      return RwaTokenStatus.Allowed
    }

    if (restrictedToken) {
      return RwaTokenStatus.Restricted
    }

    /**
     * A signed consent travels in the appData document, and a Solana order carries only the appData hash,
     * so a consent given here can never be proven against the order. With no fallback to offer, an
     * unknown restriction blocks instead of asking.
     *
     * This covers the lookups still being in flight, not only failed ones: the alternative is opening a
     * consent flow that cannot be honoured, and a briefly disabled button is the safer way to be wrong.
     */
    if (isSolanaChain(rwaTokenInfo.token.chainId)) {
      return RwaTokenStatus.Restricted
    }

    if (consentStatus === 'valid') {
      return RwaTokenStatus.ConsentIsSigned
    }

    return RwaTokenStatus.RequiredConsent
  }, [isEnabled, rwaTokenInfo, restrictedToken, consentStatus])

  return useMemo(() => ({ status, rwaTokenInfo }), [status, rwaTokenInfo])
}

function findToken(
  input: TokenCheck,
  output: TokenCheck,
  predicate: (check: TokenCheck) => boolean,
): Token | undefined {
  if (input.token && predicate(input)) return input.token
  if (output.token && predicate(output)) return output.token

  return undefined
}

function isRestricted({ restriction }: TokenCheck): boolean {
  return !!restriction?.restricted
}

function isUnresolvedRwa({ isRwa, restriction }: TokenCheck): boolean {
  return isRwa && !restriction
}
