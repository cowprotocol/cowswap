import { TokenWithLogo } from '@cowprotocol/common-const'

export interface RwaTokenInfo {
  issuer: string
  tosVersion: string
  issuerName?: string
  assetGroup?: string
  token?: TokenWithLogo
}

/**
 * @deprecated Use useRwaTokenStatus hook instead.
 * This function was used for testing purposes only.
 */
export function getRwaTokenInfo(): RwaTokenInfo | null {
  // This function is deprecated - use useRwaTokenStatus hook instead
  // The hook checks tokens against the Ondo token list
  return null
}
