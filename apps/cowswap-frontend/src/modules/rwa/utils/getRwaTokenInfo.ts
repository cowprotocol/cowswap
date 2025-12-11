import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency } from '@uniswap/sdk-core'

export interface RwaTokenInfo {
  issuer: string
  tosVersion: string
  issuerName?: string
  assetGroup?: string
  token?: TokenWithLogo
}

// todo: Implement actual RWA token detection
export function getRwaTokenInfo(currency: Currency | null): RwaTokenInfo | null {
  if (!currency) {
    return null
  }

  // todo for test purposes only
  return {
    issuer: 'TEST',
    tosVersion: 'rwa-tos-2025-01-01',
    issuerName: 'Test Issuer',
    assetGroup: 'tokenized_securities',
    token: currency.isToken ? (currency as TokenWithLogo) : undefined,
  }
}
