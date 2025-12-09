import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency } from '@uniswap/sdk-core'

export interface RwaTokenInfo {
  issuer: string
  tosVersion: string
  issuerName?: string
  assetGroup?: string
  token?: TokenWithLogo
}

// TODO: Implement actual RWA token detection
export function getRwaTokenInfo(currency: Currency | null): RwaTokenInfo | null {
  if (!currency) {
    return null
  }

  // TODO: add Check if currency is RWA-restricted
  return {
    issuer: 'TEST',
    tosVersion: 'rwa-tos-2025-01-01',
    issuerName: 'Test Issuer',
    assetGroup: 'tokenized_securities',
    token: currency.isToken ? (currency as TokenWithLogo) : undefined,
  }
}
