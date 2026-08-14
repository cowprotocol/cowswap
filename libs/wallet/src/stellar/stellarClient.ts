import { IS_STELLAR_ENABLED } from '@cowprotocol/common-const'

import * as StellarSdk from '@stellar/stellar-sdk'

/** Stellar Horizon public endpoint for mainnet. */
const STELLAR_HORIZON_URL = 'https://horizon.stellar.org'

/** Stellar Horizon public endpoint for testnet. */
const STELLAR_TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org'

export interface StellarClientConfig {
  /** Use testnet instead of mainnet. Defaults to false. */
  useTestnet?: boolean
}

/**
 * Returns a configured Stellar Horizon server instance.
 *
 * Gated behind the IS_STELLAR_ENABLED feature flag — returns `undefined`
 * when Stellar support is disabled.
 */
export function getStellarServer(config?: StellarClientConfig): StellarSdk.Horizon.Server | undefined {
  if (!IS_STELLAR_ENABLED) return undefined

  const url = config?.useTestnet ? STELLAR_TESTNET_HORIZON_URL : STELLAR_HORIZON_URL
  return new StellarSdk.Horizon.Server(url)
}

/**
 * Validates whether a string is a valid Stellar public key (G... address).
 */
export function isValidStellarAddress(address: string): boolean {
  try {
    StellarSdk.Keypair.fromPublicKey(address)
    return true
  } catch {
    return false
  }
}

export { StellarSdk }
